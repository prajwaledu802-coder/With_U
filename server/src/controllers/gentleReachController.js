const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const TrustedContact = require('../models/TrustedContact');
const GentleReachEvent = require('../models/GentleReachEvent');
const Sentiment = require('../models/Sentiment');
const { detectStressTrend } = require('../services/sentimentService');
const { sendGentleReach } = require('../services/notificationService');
const logger = require('../utils/logger');

const COOLDOWN_HOURS = 24;

const maybeTriggerGentleReach = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.settings?.gentleReachEnabled) return null;

  const sentiments = await Sentiment.find({ user: userId }).sort({ date: -1 }).limit(7).lean();
  const trend = detectStressTrend(sentiments);
  if (!trend.worsening) return null;

  const sustainedHigh = sentiments.slice(0, 3).every((s) => (s.stressLevel || 0) >= 50);
  if (!sustainedHigh) return null;

  const contact = await TrustedContact.findOne({
    user: userId,
    notifyOnHighStress: true,
  }).sort({ isPrimary: -1, createdAt: 1 });
  if (!contact) return null;

  if (contact.lastNotifiedAt) {
    const hoursSince = (Date.now() - contact.lastNotifiedAt.getTime()) / 36e5;
    if (hoursSince < COOLDOWN_HOURS) return null;
  }

  const event = await GentleReachEvent.create({
    user: userId,
    contact: contact._id,
    trigger: 'stress_trend',
    stressLevel: sentiments[0]?.stressLevel || 0,
    channel: process.env.ENABLE_REAL_EMAIL === 'true' ? 'email' : 'mock',
    status: 'pending',
  });

  try {
    const sendResult = await sendGentleReach({
      to: contact.email,
      caregiverName: user.name || 'someone you care about',
      contactName: contact.name,
      language: user.settings?.language || 'en',
    });

    event.status = sendResult.success ? 'sent' : 'failed';
    event.message = sendResult.messageId || '';
    event.error = sendResult.error || null;
    event.sentAt = sendResult.success ? new Date() : null;
    await event.save();

    if (sendResult.success) {
      contact.lastNotifiedAt = new Date();
      await contact.save();
    }
    logger.info(`GentleReach for user ${userId} -> ${event.status}`);
    return event;
  } catch (err) {
    event.status = 'failed';
    event.error = err.message;
    await event.save();
    return event;
  }
};

exports.maybeTriggerGentleReach = maybeTriggerGentleReach;

exports.triggerManual = asyncHandler(async (req, res) => {
  const user = req.user;
  const contact = await TrustedContact.findOne({
    user: user._id,
    ...(req.body.contactId ? { _id: req.body.contactId } : {}),
  }).sort({ isPrimary: -1 });

  if (!contact) throw new ApiError(404, 'No trusted contact found');

  const event = await GentleReachEvent.create({
    user: user._id,
    contact: contact._id,
    trigger: 'manual',
    channel: process.env.ENABLE_REAL_EMAIL === 'true' ? 'email' : 'mock',
    status: 'pending',
  });

  const sendResult = await sendGentleReach({
    to: contact.email,
    caregiverName: user.name || 'someone you care about',
    contactName: contact.name,
    language: user.settings?.language || 'en',
  });

  event.status = sendResult.success ? 'sent' : 'failed';
  event.message = sendResult.messageId || '';
  event.error = sendResult.error || null;
  event.sentAt = sendResult.success ? new Date() : null;
  await event.save();

  if (sendResult.success) {
    contact.lastNotifiedAt = new Date();
    await contact.save();
  }

  res.json({ success: true, event, mock: sendResult.mock });
});

exports.history = asyncHandler(async (req, res) => {
  const items = await GentleReachEvent.find({ user: req.user._id })
    .populate('contact', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, items });
});

exports.toggle = asyncHandler(async (req, res) => {
  const enabled = !!req.body.enabled;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { 'settings.gentleReachEnabled': enabled },
    { new: true }
  );
  res.json({ success: true, enabled: user.settings.gentleReachEnabled });
});
