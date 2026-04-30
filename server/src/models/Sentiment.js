const mongoose = require('mongoose');

const sentimentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    averageScore: { type: Number, default: 0 },
    label: {
      type: String,
      enum: ['very_low', 'low', 'neutral', 'positive', 'very_positive'],
      default: 'neutral',
    },
    entryCount: { type: Number, default: 0 },
    stressLevel: { type: Number, min: 0, max: 100, default: 0 },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

sentimentSchema.index({ user: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('Sentiment', sentimentSchema);
