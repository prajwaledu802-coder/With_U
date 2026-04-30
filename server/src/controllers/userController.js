const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'role', 'timezone', 'avatarUrl'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
  res.json({ success: true, user: user.toSafeJSON() });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const allowed = [
    'theme',
    'language',
    'gentleReachEnabled',
    'voiceResponses',
    'nudgeFrequency',
    'privacyMode',
  ];
  const update = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) update[`settings.${k}`] = req.body[k];
  }
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
  res.json({ success: true, settings: user.settings });
});

exports.getSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, settings: req.user.settings });
});
