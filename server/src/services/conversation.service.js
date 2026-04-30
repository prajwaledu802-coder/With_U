const Conversation = require('../models/conversation.model');
const memory = require('../ai/memory.engine');

const startSession = async (userId, language = 'en', title = 'Aira session') => {
  const conv = await Conversation.create({ user: userId, language, title });
  return conv;
};

const appendMessage = async (conversationId, message) => {
  if (!conversationId) return null;
  const update = {
    $push: { messages: { ...message, ts: message.ts || new Date() } },
    $set: {
      lastStressScore: typeof message.stressScore === 'number' ? message.stressScore : undefined,
    },
  };
  if (update.$set.lastStressScore === undefined) delete update.$set.lastStressScore;
  return Conversation.findByIdAndUpdate(conversationId, update, { new: true });
};

const listForUser = async (userId, { limit = 25, archived = false } = {}) =>
  Conversation.find({ user: userId, archived }).sort({ updatedAt: -1 }).limit(limit).lean();

const getById = async (conversationId, userId) =>
  Conversation.findOne({ _id: conversationId, user: userId }).lean();

const archive = async (conversationId, userId) =>
  Conversation.findOneAndUpdate({ _id: conversationId, user: userId }, { archived: true }, { new: true });

const remove = async (conversationId, userId) =>
  Conversation.findOneAndDelete({ _id: conversationId, user: userId });

const rememberTurn = async (userId, turn) => memory.remember(userId, turn);
const recallContext = async (userId, n = 6) => memory.recentHistoryForLLM(userId, n);

module.exports = {
  startSession,
  appendMessage,
  listForUser,
  getById,
  archive,
  remove,
  rememberTurn,
  recallContext,
};
