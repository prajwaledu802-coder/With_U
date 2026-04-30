const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    durationMs: { type: Number, default: 0 },
    avgStress: { type: Number, default: 0 },
    peakStress: { type: Number, default: 0 },
    deviceInfo: { type: Object, default: {} },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, startedAt: -1 });

module.exports = mongoose.models.AppSession || mongoose.model('AppSession', sessionSchema);
