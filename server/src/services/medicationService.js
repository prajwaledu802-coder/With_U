/**
 * Smart Medication service
 *
 * - Computes the next upcoming dose for a list of medications.
 * - Sends reminder notifications (Twilio if real, mocked otherwise).
 * - Provides a single helper to retrieve "the user's known mobile" by
 *   pulling it from the most recent medication entry — this is the
 *   canonical source per product requirement.
 */
const axios = require('axios');
const logger = require('../utils/logger');
const Medication = require('../models/Medication');

const SMS_ENABLED = process.env.ENABLE_REAL_SMS === 'true';
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;

const sendReminderSMS = async (mobile, message) => {
  if (!SMS_ENABLED || !TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    logger.info(`[SMS:mock] → ${mobile}: ${message}`);
    return { mock: true, ok: true };
  }
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
    const params = new URLSearchParams({ To: mobile, From: TWILIO_FROM, Body: message });
    await axios.post(url, params, {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 10000,
    });
    return { mock: false, ok: true };
  } catch (err) {
    logger.error('Twilio SMS error:', err.message);
    return { mock: false, ok: false, error: err.message };
  }
};

const computeNextDose = (med, now = new Date()) => {
  if (!med.times?.length) return null;
  const today = now;
  const minsNow = today.getHours() * 60 + today.getMinutes();

  let bestToday = null;
  for (const t of med.times) {
    const [h, m] = t.split(':').map(Number);
    const mins = h * 60 + m;
    if (mins >= minsNow && (bestToday == null || mins < bestToday)) bestToday = mins;
  }
  if (bestToday != null) {
    const d = new Date(today);
    d.setHours(Math.floor(bestToday / 60), bestToday % 60, 0, 0);
    return d;
  }
  const earliest = Math.min(
    ...med.times.map((t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    })
  );
  const d = new Date(today);
  d.setDate(d.getDate() + 1);
  d.setHours(Math.floor(earliest / 60), earliest % 60, 0, 0);
  return d;
};

/**
 * Given a list of times (HH:MM), find the most recent one that already
 * passed today (or yesterday's last). Used to detect "you missed this dose".
 */
const computeCurrentDoseSlot = (med, now = new Date()) => {
  if (!med.times?.length) return null;
  const minsNow = now.getHours() * 60 + now.getMinutes();
  let bestSlot = null;
  for (const t of med.times) {
    const [h, m] = t.split(':').map(Number);
    const mins = h * 60 + m;
    if (mins <= minsNow && (bestSlot == null || mins > bestSlot)) bestSlot = mins;
  }
  if (bestSlot == null) return null;
  const d = new Date(now);
  d.setHours(Math.floor(bestSlot / 60), bestSlot % 60, 0, 0);
  return d;
};

const getCanonicalMobile = async (userId) => {
  const med = await Medication.findOne({ user: userId, active: true })
    .sort({ updatedAt: -1 })
    .select('mobileNumber countryCode')
    .lean();
  if (!med) return null;
  return {
    mobile: med.mobileNumber,
    countryCode: med.countryCode,
    full: `${med.countryCode || ''}${med.mobileNumber}`.replace(/\s+/g, ''),
  };
};

const enrichMedication = (med) => {
  const next = computeNextDose(med);
  const currentSlot = computeCurrentDoseSlot(med);
  const now = Date.now();
  const nextDoseInMinutes = next ? Math.round((next.getTime() - now) / 60000) : null;
  const today = new Date().toISOString().slice(0, 10);

  // "Due now" if a scheduled time is within the last 15 minutes and hasn't been
  // taken since that scheduled slot.
  let isDue = false;
  let dueSlot = null;
  if (currentSlot) {
    const slotAge = now - currentSlot.getTime();
    const lastTaken = med.lastTakenAt ? new Date(med.lastTakenAt).getTime() : 0;
    const slotKey = `${today}|${currentSlot.getHours().toString().padStart(2,'0')}:${currentSlot.getMinutes().toString().padStart(2,'0')}`;
    const alreadyReminded = (med.remindedSlots || []).includes(slotKey);

    // Due if within 15 minutes of scheduled time, not yet taken, and not already reminded
    if (slotAge <= 15 * 60 * 1000 && slotAge >= -60 * 1000 && lastTaken < currentSlot.getTime() && !alreadyReminded) {
      isDue = true;
      dueSlot = currentSlot;
    }
  }
  // Also fire if next dose is within 1 minute
  if (!isDue && nextDoseInMinutes != null && nextDoseInMinutes <= 0 && nextDoseInMinutes >= -1) {
    isDue = true;
    dueSlot = next;
  }

  return {
    ...med,
    nextDoseAt: next,
    nextDoseInMinutes,
    isDue,
    dueSlot,
  };
};

/**
 * Find every active medication that is "due now" for any user (used by the
 * /due endpoint and the scheduler).
 */
const findDueMedications = async (userId) => {
  const Medication = require('../models/Medication');
  const filter = { active: true };
  if (userId) filter.user = userId;
  const list = await Medication.find(filter).lean();
  return list.map(enrichMedication).filter((m) => m.isDue);
};

/**
 * Build a friendly SMS reminder message.
 */
const buildReminderMessage = (med) => {
  const name = med.name || 'your medication';
  const dosage = med.dosage ? ` (${med.dosage})` : '';
  return `Hi, this is your WITH-U companion 💙\nTime to take your ${name}${dosage}. Stay consistent and take care.`;
};

/**
 * Generate a personalized insight string for a medication.
 */
const generateInsight = (med) => {
  const name = med.name || 'this medication';
  const duration = med.duration || '';
  const effects = med.effects || '';

  let insight = `You're currently taking ${name}`;
  if (duration) insight += ` for ${duration}`;
  insight += '.';

  if (effects === 'good') {
    insight += ` Great news — you're experiencing positive results. Keep it up!`;
  } else if (effects === 'side_effects') {
    insight += ` You mentioned some side effects. Consider discussing this with your doctor.`;
  } else if (effects === 'no_change') {
    insight += ` No noticeable change yet. Give it some more time, and consult your doctor if needed.`;
  }

  return insight;
};

module.exports = {
  sendReminderSMS,
  buildReminderMessage,
  generateInsight,
  computeNextDose,
  computeCurrentDoseSlot,
  getCanonicalMobile,
  enrichMedication,
  findDueMedications,
};
