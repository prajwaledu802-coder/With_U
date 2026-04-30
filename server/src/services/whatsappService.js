const twilio = require('twilio');
const logger = require('../utils/logger');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SMS_FROM = process.env.TWILIO_SMS_FROM || process.env.TWILIO_FROM_NUMBER || '+15005550006';
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
const WHATSAPP_CONTENT_SID = process.env.TWILIO_WHATSAPP_CONTENT_SID || 'HXb5b62575e6e4ff6129ad7c8efe1f983e';

let client = null;
const isEnabled = () => !!(ACCOUNT_SID && AUTH_TOKEN && process.env.ENABLE_REAL_SMS === 'true');

const getClient = () => {
  if (!client && isEnabled()) {
    client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  }
  return client;
};

/**
 * Send a WhatsApp message via Twilio using content template
 */
const sendWhatsApp = async (to, message, contentVars) => {
  const phone = to.replace(/\D/g, '');
  const whatsappTo = `whatsapp:+91${phone}`;

  if (!isEnabled()) {
    logger.info(`[WhatsApp-SIM] → ${whatsappTo}: ${message}`);
    return { success: true, simulated: true, to: whatsappTo, message };
  }

  try {
    const tw = getClient();
    const fromNum = WHATSAPP_FROM.startsWith('whatsapp:') ? WHATSAPP_FROM : `whatsapp:${WHATSAPP_FROM}`;
    
    // Use content template if available, otherwise plain body
    const msgData = {
      from: fromNum,
      to: whatsappTo,
    };

    if (WHATSAPP_CONTENT_SID && contentVars) {
      msgData.contentSid = WHATSAPP_CONTENT_SID;
      msgData.contentVariables = JSON.stringify(contentVars);
    } else {
      msgData.body = message;
    }

    const result = await tw.messages.create(msgData);
    logger.info(`[WhatsApp] Sent to ${whatsappTo} — SID: ${result.sid}`);
    return { success: true, sid: result.sid, to: whatsappTo };
  } catch (err) {
    logger.error(`[WhatsApp] Failed to ${whatsappTo}:`, err.message);
    return { success: false, error: err.message, to: whatsappTo };
  }
};

/**
 * Send an SMS via Twilio
 */
const sendSMS = async (to, message) => {
  const phone = to.replace(/\D/g, '');
  const smsTo = `+91${phone}`;

  if (!isEnabled()) {
    logger.info(`[SMS-SIM] → ${smsTo}: ${message}`);
    return { success: true, simulated: true, to: smsTo, message };
  }

  try {
    const tw = getClient();
    const result = await tw.messages.create({
      from: SMS_FROM.replace('whatsapp:', ''),
      to: smsTo,
      body: message,
    });
    logger.info(`[SMS] Sent to ${smsTo} — SID: ${result.sid}`);
    return { success: true, sid: result.sid, to: smsTo };
  } catch (err) {
    logger.error(`[SMS] Failed to ${smsTo}:`, err.message);
    return { success: false, error: err.message, to: smsTo };
  }
};

/**
 * Send a medication reminder via WhatsApp (uses content template)
 */
const sendMedicationReminder = async (phone, medName, dosage, time) => {
  const timeStr = time || 'now';
  const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  const msg = `💊 Hi! It's time to take your medication:\n\n*${medName}*${dosage ? ` (${dosage})` : ''}\n⏰ Scheduled: ${timeStr}\n\nTake care of yourself! — WITH_U`;
  // Content template vars: {"1": "date", "2": "time"}
  const contentVars = { "1": today, "2": `${timeStr} - ${medName}${dosage ? ' (' + dosage + ')' : ''}` };
  return sendWhatsApp(phone, msg, contentVars);
};

/**
 * Send a medication reminder via SMS
 */
const sendMedicationReminderSMS = async (phone, medName, dosage, time) => {
  const timeStr = time || 'now';
  const msg = `💊 WITH_U Reminder: Time to take ${medName}${dosage ? ` (${dosage})` : ''} — Scheduled: ${timeStr}. Take care!`;
  return sendSMS(phone, msg);
};

module.exports = { sendWhatsApp, sendSMS, sendMedicationReminder, sendMedicationReminderSMS, isEnabled };
