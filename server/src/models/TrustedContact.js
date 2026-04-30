const mongoose = require('mongoose');

const trustedContactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: null },
    relation: { type: String, trim: true, default: 'Friend' },
    isPrimary: { type: Boolean, default: false },
    notifyOnHighStress: { type: Boolean, default: true },
    lastNotifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

trustedContactSchema.index({ user: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('TrustedContact', trustedContactSchema);
