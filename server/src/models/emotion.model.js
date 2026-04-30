const mongoose = require('mongoose');

const emotionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    source: { type: String, enum: ['text', 'voice', 'face', 'fused'], required: true },
    emotion: { type: String, required: true },
    stressScore: { type: Number, default: 0 },
    confidence: { type: Number, default: 0.5 },
    raw: { type: Object, default: {} },
  },
  { timestamps: true }
);

emotionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.EmotionLog || mongoose.model('EmotionLog', emotionSchema);
