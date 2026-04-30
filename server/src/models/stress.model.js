const mongoose = require('mongoose');

const stressEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    level: { type: String, enum: ['low', 'moderate', 'high', 'critical'], required: true },
    breakdown: {
      sentiment: Number,
      typing: Number,
      session: Number,
      lateNight: Number,
      interaction: Number,
    },
    source: { type: String, enum: ['text', 'voice', 'face', 'fused', 'quiz'], default: 'text' },
    triggeredSOS: { type: Boolean, default: false },
  },
  { timestamps: true }
);

stressEntrySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.StressEntry || mongoose.model('StressEntry', stressEntrySchema);
