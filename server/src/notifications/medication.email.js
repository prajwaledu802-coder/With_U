/**
 * Medication Email Service
 * - Confirmation emails (with verify link)
 * - Scheduled reminder emails
 */
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const ENABLE_REAL = process.env.ENABLE_REAL_EMAIL === 'true';
const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;

let transporter = null;
const getTransporter = () => {
  if (!ENABLE_REAL) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
};

/* ─────────────────────────────────────────────
   1. CONFIRMATION EMAIL
   ───────────────────────────────────────────── */
const buildConfirmationHTML = ({ medName, dosage, times, icon, userName, confirmUrl }) => {
  const safeIcon = icon || '💊';
  const safeName = medName || 'your medication';
  const safeUserName = userName || 'there';
  const timesStr = (times || []).join(', ') || 'as scheduled';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0a1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <div style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%);border-radius:24px;padding:32px 28px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">${safeIcon}</div>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px">
        Confirm Your Medication Reminders
      </h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85)">
        Hi ${safeUserName}, please verify your email to activate reminders
      </p>
    </div>
    <div style="background:#fff;border-radius:20px;padding:28px 24px;margin-top:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:500">Medication</td>
          <td style="padding:8px 0;font-size:16px;color:#1f2937;font-weight:600;text-align:right">${safeName}</td>
        </tr>
        ${dosage ? `<tr><td style="padding:8px 0;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:500">Dosage</td><td style="padding:8px 0;font-size:15px;color:#7c3aed;font-weight:600;text-align:right">${dosage}</td></tr>` : ''}
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:500">Schedule</td>
          <td style="padding:8px 0;font-size:15px;color:#1f2937;font-weight:500;text-align:right">⏰ ${timesStr}</td>
        </tr>
      </table>
      <div style="text-align:center;margin-top:24px">
        <a href="${confirmUrl}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:16px;font-weight:600;border-radius:14px;text-decoration:none;letter-spacing:0.3px">
          ✅ Activate My Reminders
        </a>
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center">
        Or copy this link: <a href="${confirmUrl}" style="color:#7c3aed;word-break:break-all">${confirmUrl}</a>
      </p>
    </div>
    <div style="text-align:center;margin-top:24px;padding:20px">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5)">
        Once confirmed, you'll receive reminders at your scheduled times via WhatsApp + Email 💙
      </p>
      <p style="margin:12px 0 0;font-size:11px;color:rgba(255,255,255,0.3)">— WITH_U Medication Reminders</p>
    </div>
  </div>
</body>
</html>`;
};

const sendConfirmationEmail = async ({ to, medName, dosage, times, icon, userName, confirmationToken, medId }) => {
  if (!to || !to.includes('@')) {
    logger.info(`[MedEmail] Skipped confirmation — no valid email`);
    return { success: false, mock: true, reason: 'no_email' };
  }

  const confirmUrl = `${API_URL}/api/medications/confirm?token=${confirmationToken}&id=${medId}`;
  const subject = `✅ Confirm your medication reminders — ${medName || 'WITH_U'}`;
  const html = buildConfirmationHTML({ medName, dosage, times, icon, userName, confirmUrl });
  const text = `Hi ${userName || 'there'},\n\nPlease confirm your email to activate medication reminders for ${medName || 'your medication'}${dosage ? ` (${dosage})` : ''}.\n\nClick here to activate: ${confirmUrl}\n\nOnce confirmed, you'll receive reminders at your scheduled times.\n\n— WITH_U`;

  const t = getTransporter();
  if (!t) {
    logger.info(`[MedEmail:mock] Confirmation → ${to} for ${medName} | Link: ${confirmUrl}`);
    return { success: true, mock: true, to, confirmUrl };
  }

  try {
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || 'WITH_U <noreply@with-u.app>',
      to, subject, text, html,
    });
    logger.info(`[MedEmail] Confirmation sent to ${to} — ID: ${info.messageId}`);
    return { success: true, mock: false, messageId: info.messageId, to };
  } catch (err) {
    logger.error(`[MedEmail] Confirmation failed to ${to}:`, err.message);
    return { success: false, mock: false, error: err.message, to };
  }
};

/* ─────────────────────────────────────────────
   2. REMINDER EMAIL (only for verified meds)
   ───────────────────────────────────────────── */
const buildMedicationReminderHTML = ({ medName, dosage, time, notes, icon, userName }) => {
  const safeIcon = icon || '💊';
  const safeName = medName || 'your medication';
  const safeTime = time || 'now';
  const safeUserName = userName || 'there';
  const notesBlock = notes
    ? `<div style="margin-top:16px;padding:12px 16px;background:#f5f3ff;border-radius:12px;border-left:3px solid #a78bfa"><p style="margin:0;font-size:13px;color:#6b7280;font-style:italic">"${notes}"</p></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0a1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <div style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%);border-radius:24px;padding:32px 28px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">${safeIcon}</div>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px">Medication Reminder 💊</h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85)">Hi ${safeUserName}, it's time for your medication</p>
    </div>
    <div style="background:#fff;border-radius:20px;padding:28px 24px;margin-top:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:500">Medication</td><td style="padding:8px 0;font-size:16px;color:#1f2937;font-weight:600;text-align:right">${safeName}</td></tr>
        ${dosage ? `<tr><td style="padding:8px 0;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:500">Dosage</td><td style="padding:8px 0;font-size:15px;color:#7c3aed;font-weight:600;text-align:right">${dosage}</td></tr>` : ''}
        <tr><td style="padding:8px 0;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:500">Scheduled</td><td style="padding:8px 0;font-size:15px;color:#1f2937;font-weight:500;text-align:right">⏰ ${safeTime}</td></tr>
      </table>
      ${notesBlock}
      <div style="text-align:center;margin-top:20px;padding:14px;background:linear-gradient(135deg,rgba(52,211,153,0.1),rgba(167,139,250,0.1));border-radius:12px">
        <p style="margin:0;font-size:14px;color:#1f2937;font-weight:500">Time to take your <strong>${safeName}</strong>${dosage ? ` (${dosage})` : ''}</p>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;padding:20px">
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.6)">Stay consistent — every dose counts 💙</p>
      <p style="margin:12px 0 0;font-size:11px;color:rgba(255,255,255,0.3)">— WITH_U Medication Reminders</p>
    </div>
  </div>
</body>
</html>`;
};

const sendMedicationReminderEmail = async ({ to, medName, dosage, time, notes, icon, userName }) => {
  if (!to || !to.includes('@')) {
    logger.info(`[MedEmail] Skipped — no valid email for ${medName}`);
    return { success: false, mock: true, reason: 'no_email' };
  }

  const subject = `💊 Medication Reminder: Time for ${medName || 'your medication'} — WITH_U`;
  const html = buildMedicationReminderHTML({ medName, dosage, time, notes, icon, userName });
  const text = `Hi ${userName || 'there'},\n\nThis is your WITH_U medication reminder.\n\n💊 ${medName || 'Your medication'}${dosage ? ` (${dosage})` : ''}\n⏰ Scheduled: ${time || 'now'}\n${notes ? `📝 Notes: ${notes}\n` : ''}\nStay consistent — every dose counts!\n\n— WITH_U`;

  const t = getTransporter();
  if (!t) {
    logger.info(`[MedEmail:mock] → ${to}: Reminder for ${medName}`);
    return { success: true, mock: true, to };
  }

  try {
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || 'WITH_U <noreply@with-u.app>',
      to, subject, text, html,
    });
    logger.info(`[MedEmail] Sent to ${to} for ${medName} — ID: ${info.messageId}`);
    return { success: true, mock: false, messageId: info.messageId, to };
  } catch (err) {
    logger.error(`[MedEmail] Failed to ${to}:`, err.message);
    return { success: false, mock: false, error: err.message, to };
  }
};

module.exports = {
  sendConfirmationEmail,
  sendMedicationReminderEmail,
  buildConfirmationHTML,
  buildMedicationReminderHTML,
};
