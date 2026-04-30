const mongoose = require('mongoose');

const gentleReachEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'TrustedContact', required: true },
    trigger: {
      type: String,
      enum: ['stress_trend', 'manual', 'sustained_low_mood'],
      default: 'stress_trend',
    },
    stressLevel: { type: Number, default: 0 },
    channel: { type: String, enum: ['email', 'sms', 'mock'], default: 'email' },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'cancelled'],
      default: 'pending',
    },
    message: { type: String, default: '' },
    error: { type: String, default: null },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

gentleReachEventSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('GentleReachEvent', gentleReachEventSchema);
