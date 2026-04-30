const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ChatSession = require('../models/ChatSession');

const truncate = (text, max = 46) => {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
};

exports.list = asyncHandler(async (req, res) => {
  const items = await ChatSession.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .select('title lastMessage lastStressScore createdAt updatedAt messages')
    .lean();

  res.json({
    success: true,
    items: items.map((s) => ({
      _id: s._id,
      title: s.title,
      lastMessage: s.lastMessage,
      lastStressScore: s.lastStressScore || 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      messageCount: s.messages?.length || 0,
    })),
  });
});

exports.create = asyncHandler(async (req, res) => {
  const title = (req.body?.title || 'New session').toString().trim() || 'New session';
  const session = await ChatSession.create({
    user: req.user._id,
    title,
  });
  res.status(201).json({ success: true, session });
});

exports.get = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!session) throw new ApiError(404, 'Session not found');
  res.json({ success: true, session });
});

exports.appendMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (!messages.length) throw new ApiError(400, 'messages required');

  const session = await ChatSession.findOne({ _id: id, user: req.user._id });
  if (!session) throw new ApiError(404, 'Session not found');

  const cleaned = messages
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({
      role: ['user', 'companion', 'system'].includes(m.role) ? m.role : 'user',
      text: m.text.trim(),
      ts: m.ts ? new Date(m.ts) : new Date(),
      stressScore: typeof m.stressScore === 'number' ? m.stressScore : null,
    }));

  if (!cleaned.length) throw new ApiError(400, 'messages required');

  session.messages.push(...cleaned);

  const last = cleaned[cleaned.length - 1];
  session.lastMessage = truncate(last.text);
  if (typeof last.stressScore === 'number') session.lastStressScore = last.stressScore;

  if (!session.title || session.title === 'New session') {
    const firstUser = cleaned.find((m) => m.role === 'user');
    if (firstUser) session.title = truncate(firstUser.text, 36) || 'New session';
  }

  if (session.messages.length > 300) {
    session.messages = session.messages.slice(-300);
  }

  await session.save();
  res.json({ success: true, session });
});

exports.remove = asyncHandler(async (req, res) => {
  const session = await ChatSession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!session) throw new ApiError(404, 'Session not found');
  res.json({ success: true });
});
