const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: {
      type: String,
      enum: ['session_start', 'session_end', 'sleep', 'wake', 'late_night', 'game', 'music', 'breathing', 'sos', 'feedback'],
      required: true,
    },
    payload: { type: Object, default: {} },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, kind: 1, createdAt: -1 });

module.exports = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
