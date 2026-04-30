const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'aira', 'system'], required: true },
    text: { type: String, required: true },
    language: { type: String, default: 'en' },
    emotion: { type: String, default: null },
    stressScore: { type: Number, default: null },
    voice: { type: String, default: null },
    ts: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Aira session', trim: true },
    language: { type: String, default: 'en' },
    messages: { type: [messageSchema], default: [] },
    summary: { type: String, default: '' },
    lastStressScore: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
