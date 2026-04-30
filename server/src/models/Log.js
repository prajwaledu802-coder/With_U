const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['text', 'voice'], default: 'text' },
    content: { type: String, required: true, trim: true },
    transcript: { type: String, default: null },
    audioUrl: { type: String, default: null },
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    sentimentScore: { type: Number, default: 0 },
    sentimentLabel: {
      type: String,
      enum: ['very_low', 'low', 'neutral', 'positive', 'very_positive'],
      default: 'neutral',
    },
    keywords: [{ type: String }],
    stressIndicators: {
      exhaustion: { type: Number, default: 0 },
      overwhelm: { type: Number, default: 0 },
      isolation: { type: Number, default: 0 },
      worry: { type: Number, default: 0 },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

logSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);
