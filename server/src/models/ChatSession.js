const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'companion', 'system'], required: true },
    text: { type: String, required: true, trim: true },
    ts: { type: Date, default: Date.now },
    stressScore: { type: Number, default: null },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New session', trim: true },
    messages: { type: [messageSchema], default: [] },
    lastMessage: { type: String, default: '' },
    lastStressScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chatSessionSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
