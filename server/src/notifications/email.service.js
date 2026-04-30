const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;
const ensureTransporter = () => {
  if (transporter || !env.enableRealEmail) return transporter;
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
    });
  } catch (err) {
    logger.warn('[email] nodemailer init failed:', err.message);
  }
  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject) return { success: false, message: 'missing to/subject', mock: true };
  if (!env.enableRealEmail) {
    logger.info(`[email mock] to=${to} subject="${subject}"`);
    return { success: true, mock: true };
  }
  const tx = ensureTransporter();
  if (!tx) return { success: false, message: 'transport unavailable', mock: true };
  try {
    const info = await tx.sendMail({
      from: env.smtpFrom,
      to,
      subject,
      text,
      html: html || `<p>${text || ''}</p>`,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error('[email] send failed:', err.message);
    return { success: false, message: err.message };
  }
};

module.exports = { sendEmail };
