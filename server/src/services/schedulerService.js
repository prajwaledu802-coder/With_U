const Medication = require('../models/Medication');
const { sendMedicationReminder, sendMedicationReminderSMS } = require('../services/whatsappService');
const { sendMedicationReminderEmail } = require('../notifications/medication.email');
const { enrichMedication, findDueMedications } = require('../services/medicationService');
const User = require('../models/User');
const logger = require('../utils/logger');

let reminderInterval = null;
const POLL_MS = 60 * 1000; // Check every 60 seconds

// Track which meds we've already reminded (slot-based)
const remindedSet = new Set();

const formatTime12 = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
};

const checkAndSend = async () => {
  try {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const today = now.toISOString().slice(0, 10);

    // Fetch active medications — email reminders only for verified ones
    const meds = await Medication.find({ active: true }).lean();

    for (const med of meds) {
      for (const time of (med.times || [])) {
        const [th, tm] = time.split(':').map(Number);
        const diff = (now.getHours() * 60 + now.getMinutes()) - (th * 60 + tm);

        // Remind if within 0-5 minute window after scheduled time
        if (diff >= 0 && diff <= 5) {
          const slotKey = `${med._id}|${today}|${time}`;
          if (remindedSet.has(slotKey)) continue;

          remindedSet.add(slotKey);
          const phone = med.mobileNumber;
          const formattedTime = formatTime12(time);

          // Fetch user name for email personalization
          let userName = 'there';
          try {
            const user = await User.findById(med.user).select('name email').lean();
            if (user?.name) userName = user.name;
          } catch {}

          // ── WhatsApp Reminder ──
          if (med.enableWhatsApp !== false && phone) {
            try {
              const result = await sendMedicationReminder(phone, med.name, med.dosage, formattedTime);
              logger.info(`[Scheduler] WhatsApp reminder for ${med.name} at ${time} → ${result.success ? 'OK' : 'FAIL'}`);
            } catch (err) {
              logger.error(`[Scheduler] WhatsApp failed for ${med.name}:`, err.message);
            }
          }

          // ── SMS Reminder ──
          if (med.enableSMS !== false && phone) {
            try {
              const result = await sendMedicationReminderSMS(phone, med.name, med.dosage, formattedTime);
              logger.info(`[Scheduler] SMS reminder for ${med.name} at ${time} → ${result.success ? 'OK' : 'FAIL'}${result.simulated ? ' (sim)' : ''}`);
            } catch (err) {
              logger.error(`[Scheduler] SMS failed for ${med.name}:`, err.message);
            }
          }

          // ── Email Reminder (ONLY for verified medications) ──
          if (med.verified && med.enableEmail !== false && med.reminderEmail) {
            try {
              const result = await sendMedicationReminderEmail({
                to: med.reminderEmail,
                medName: med.name,
                dosage: med.dosage,
                time: formattedTime,
                notes: med.notes,
                icon: med.icon,
                userName,
              });
              logger.info(`[Scheduler] Email reminder for ${med.name} at ${time} → ${result.success ? 'OK' : 'FAIL'}${result.mock ? ' (mock)' : ''}`);
            } catch (err) {
              logger.error(`[Scheduler] Email failed for ${med.name}:`, err.message);
            }
          }
        }
      }
    }

    // Clean old entries at midnight
    if (hh === '00' && mm === '00') {
      remindedSet.clear();
      logger.info('[Scheduler] Cleared daily reminder cache');
    }
  } catch (err) {
    logger.error('[Scheduler] Error:', err.message);
  }
};

const startScheduler = () => {
  if (reminderInterval) return;
  logger.info(`[Scheduler] Started — checking every ${POLL_MS / 1000}s (WhatsApp + Email)`);
  reminderInterval = setInterval(checkAndSend, POLL_MS);
  // Run once immediately
  setTimeout(checkAndSend, 5000);
};

const stopScheduler = () => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    logger.info('[Scheduler] Stopped');
  }
};

module.exports = { startScheduler, stopScheduler };
