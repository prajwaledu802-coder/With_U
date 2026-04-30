const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const ENABLE_REAL = process.env.ENABLE_REAL_EMAIL === 'true';

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

const buildGentleReachEmail = ({ caregiverName, contactName, language = 'en' }) => {
  if (language === 'hi') {
    return {
      subject: `${caregiverName} को आपकी ज़रूरत हो सकती है`,
      text: `नमस्ते ${contactName},\n\nयह WITH_U की तरफ़ से एक कोमल संदेश है। ${caregiverName} पिछले कुछ दिनों से थोड़े थके हुए लग रहे हैं। शायद एक छोटा-सा "कैसे हो?" आज उन्हें अच्छा लगे।\n\nकोई आपातकाल नहीं है — बस एक हल्की याद।\n\n— WITH_U`,
      html: `<p>नमस्ते ${contactName},</p><p>यह <b>WITH_U</b> की तरफ़ से एक कोमल संदेश है। <b>${caregiverName}</b> पिछले कुछ दिनों से थोड़े थके हुए लग रहे हैं। शायद एक छोटा-सा "कैसे हो?" आज उन्हें अच्छा लगे।</p><p>कोई आपातकाल नहीं है — बस एक हल्की याद।</p><p style="color:#888;font-size:12px">— WITH_U</p>`,
    };
  }
  return {
    subject: `A gentle nudge about ${caregiverName}`,
    text: `Hi ${contactName},\n\nThis is a quiet note from WITH_U. ${caregiverName} has been carrying a lot lately. A small check-in from you — even just "thinking of you" — could mean more than you'd expect today.\n\nNothing urgent. Just a soft reminder.\n\n— WITH_U`,
    html: `<p>Hi ${contactName},</p><p>This is a quiet note from <b>WITH_U</b>. <b>${caregiverName}</b> has been carrying a lot lately. A small check-in from you — even just "thinking of you" — could mean more than you'd expect today.</p><p>Nothing urgent. Just a soft reminder.</p><p style="color:#888;font-size:12px">— WITH_U</p>`,
  };
};

const sendGentleReach = async ({ to, caregiverName, contactName, language = 'en' }) => {
  const { subject, text, html } = buildGentleReachEmail({ caregiverName, contactName, language });

  const t = getTransporter();
  if (!t) {
    logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return { mock: true, success: true, messageId: `mock-${Date.now()}` };
  }
  try {
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || 'WITH_U <noreply@with-u.app>',
      to,
      subject,
      text,
      html,
    });
    return { mock: false, success: true, messageId: info.messageId };
  } catch (err) {
    logger.error('Email send failed:', err.message);
    return { mock: false, success: false, error: err.message };
  }
};

module.exports = { sendGentleReach };
