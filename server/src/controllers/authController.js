const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const TrustedContact = require('../models/TrustedContact');

exports.syncUser = asyncHandler(async (req, res) => {
  const { name, role, timezone, language, trustedContact } = req.body || {};
  const update = { lastSeenAt: new Date() };
  if (name) update.name = name;
  if (role) update.role = role;
  if (timezone) update.timezone = timezone;
  if (language) update['settings.language'] = language;

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });

  if (trustedContact && trustedContact.email && trustedContact.name) {
    await TrustedContact.findOneAndUpdate(
      { user: user._id, email: trustedContact.email.toLowerCase() },
      {
        user: user._id,
        name: trustedContact.name,
        email: trustedContact.email.toLowerCase(),
        phone: trustedContact.phone || null,
        relation: trustedContact.relation || 'Friend',
        isPrimary: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  res.json({ success: true, user: user.toSafeJSON() });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, user: user.toSafeJSON() });
});

exports.completeOnboarding = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { onboardingCompleted: true },
    { new: true }
  );
  res.json({ success: true, user: user.toSafeJSON() });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account removed' });
});
