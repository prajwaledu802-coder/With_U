/**
 * Call/SOS service.
 * Triggers a coordinated emergency outreach:
 *   1. WhatsApp/SMS the primary trusted contact
 *   2. Email the rest (if email available)
 *   3. Returns a payload the client can use to dial helplines
 */
const TrustedContact = require('../models/TrustedContact');
const Activity = require('../models/activity.model');
const { sendWhatsApp } = require('./whatsappService');
const { sendEmail } = require('../notifications/email.service');
const webrtc = require('../integrations/webrtc');
const { HELPLINES_IN } = require('../utils/constants');

const triggerSOS = async ({ userId, userName = 'a friend', message, stressScore = 0 }) => {
  const contacts = await TrustedContact.find({ user: userId, notifyOnHighStress: true }).lean();
  const summary = message
    || `Hi, this is Aira on behalf of ${userName}. They are feeling overwhelmed right now and could use a kind voice. Could you reach out?`;

  const results = [];
  for (const c of contacts) {
    if (c.phone) {
      const r = await sendWhatsApp(c.phone, summary);
      results.push({ to: c.phone, channel: 'whatsapp', ok: !!r?.success || !!r?.mock });
    }
    if (c.email && !c.email.endsWith('@phone.local')) {
      const r = await sendEmail({
        to: c.email,
        subject: `Aira check-in for ${userName}`,
        text: summary,
      });
      results.push({ to: c.email, channel: 'email', ok: !!r?.success || !!r?.mock });
    }
  }

  await Activity.create({
    user: userId,
    kind: 'sos',
    payload: { stressScore, contactsNotified: results.length, results },
  });

  return {
    notified: results,
    helplines: HELPLINES_IN,
    suggestedAction: stressScore >= 80 ? 'helpline' : 'trusted_contact',
  };
};

const startVideoCall = async ({ userId, peerId }) => {
  const roomId = `room_${userId}_${Date.now()}`;
  await webrtc.createRoom(roomId, userId);
  if (peerId) await webrtc.joinRoom(roomId, peerId);
  return { roomId, signallingChannel: `webrtc:${roomId}` };
};

const listHelplines = (region = 'IN') => HELPLINES_IN.filter((h) => h.region === region);

module.exports = { triggerSOS, startVideoCall, listHelplines };
