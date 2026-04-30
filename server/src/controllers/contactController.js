const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const TrustedContact = require('../models/TrustedContact');

exports.list = asyncHandler(async (req, res) => {
  const items = await TrustedContact.find({ user: req.user._id }).sort({ isPrimary: -1, createdAt: 1 });
  res.json({ success: true, items });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, email, phone, relation, isPrimary, notifyOnHighStress } = req.body || {};
  if (!name || (!email && !phone)) throw new ApiError(400, 'name and phone (or email) are required');

  const cleanPhone = phone ? String(phone).replace(/\s+/g, ' ').trim() : null;
  const safeEmail = email
    ? String(email).toLowerCase()
    : cleanPhone
      ? `${cleanPhone.replace(/\D/g, '')}@phone.local`
      : null;

  if (isPrimary) {
    await TrustedContact.updateMany({ user: req.user._id }, { isPrimary: false });
  }

  const contact = await TrustedContact.findOneAndUpdate(
    { user: req.user._id, email: safeEmail.toLowerCase() },
    {
      user: req.user._id,
      name,
      email: safeEmail.toLowerCase(),
      phone: cleanPhone || null,
      relation: relation || 'Friend',
      isPrimary: !!isPrimary,
      notifyOnHighStress: notifyOnHighStress !== false,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json({ success: true, contact });
});

exports.update = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'relation', 'isPrimary', 'notifyOnHighStress'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  if (update.isPrimary) {
    await TrustedContact.updateMany(
      { user: req.user._id, _id: { $ne: req.params.id } },
      { isPrimary: false }
    );
  }

  const contact = await TrustedContact.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    update,
    { new: true }
  );
  if (!contact) throw new ApiError(404, 'Contact not found');
  res.json({ success: true, contact });
});

exports.remove = asyncHandler(async (req, res) => {
  const contact = await TrustedContact.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!contact) throw new ApiError(404, 'Contact not found');
  res.json({ success: true, message: 'Removed' });
});
