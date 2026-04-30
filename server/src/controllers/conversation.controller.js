const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/helpers');
const conversationService = require('../services/conversation.service');
const llm = require('../ai/llm');
const prompt = require('../ai/prompt.engine');
const stressEngine = require('../ai/stress.engine');
const { decideAction, getAnimation } = require('../ai/decision.engine');
const hf = require('../integrations/huggingface');
const stressService = require('../services/stress.service');
const emotionService = require('../services/emotion.service');

exports.start = asyncHandler(async (req, res) => {
  const language = req.body?.language || req.user?.settings?.language || 'en';
  const conv = await conversationService.startSession(req.user._id, language);
  ok(res, { conversation: conv });
});

exports.list = asyncHandler(async (req, res) => {
  const items = await conversationService.listForUser(req.user._id);
  ok(res, { items });
});

exports.get = asyncHandler(async (req, res) => {
  const item = await conversationService.getById(req.params.id, req.user._id);
  if (!item) throw new ApiError(404, 'conversation not found');
  ok(res, { item });
});

exports.archive = asyncHandler(async (req, res) => {
  const item = await conversationService.archive(req.params.id, req.user._id);
  ok(res, { item });
});

exports.remove = asyncHandler(async (req, res) => {
  await conversationService.remove(req.params.id, req.user._id);
  ok(res, { removed: true });
});

/**
 * Send a message in a conversation.
 * Body: { text, language?, signals?, voice?, conversationId? }
 * Returns: { reply, stress, action, ui, emotion, voice }
 */
exports.send = asyncHandler(async (req, res) => {
  const { text = '', language, signals = {}, conversationId } = req.body || {};
  const userId = req.user?._id;
  const trimmed = (text || '').trim();
  if (!trimmed) throw new ApiError(400, 'text is required');

  const lang = language || req.user?.settings?.language || 'en';
  const userName = req.user?.name?.split(' ')[0] || 'friend';

  const emotionEntry = await emotionService.fromText(trimmed);
  if (userId) await emotionService.log(userId, emotionEntry);

  const stress = stressEngine.computeWeighted(signals, emotionEntry.stressScore);
  const tags = [];
  const action = decideAction(stress.level, tags, {});

  const history = userId ? await conversationService.recallContext(userId, 6) : [];
  const sysPrompt = prompt.buildChatPrompt(trimmed, {
    userName,
    language: lang,
    stressLevel: stress.level,
    history,
  });
  const reply = await llm.generateText(sysPrompt, { userName, emotion: emotionEntry.emotion, history });

  if (userId) {
    await stressService.log(userId, {
      score: stress.total,
      level: stress.level,
      breakdown: stress.breakdown,
      source: 'text',
      triggeredSOS: stress.total >= 80,
    });
    await conversationService.rememberTurn(userId, {
      role: 'user',
      text: trimmed,
      ts: Date.now(),
      stressScore: stress.total,
      emotion: emotionEntry.emotion,
    });
    await conversationService.rememberTurn(userId, {
      role: 'aira',
      text: reply.text,
      ts: Date.now(),
      stressScore: stress.total,
      emotion: emotionEntry.emotion,
    });
    if (conversationId) {
      await conversationService.appendMessage(conversationId, {
        role: 'user', text: trimmed, language: lang, emotion: emotionEntry.emotion, stressScore: stress.total,
      });
      await conversationService.appendMessage(conversationId, {
        role: 'aira', text: reply.text, language: lang, emotion: emotionEntry.emotion, stressScore: stress.total,
      });
    }
  }

  ok(res, {
    reply: reply.text,
    source: reply.source,
    emotion: emotionEntry.emotion,
    stress: {
      score: stress.total,
      level: stress.level,
      breakdown: stress.breakdown,
    },
    animation: getAnimation(stress.total),
    action,
    ui: { openModal: action !== 'none', type: action, sos: stress.total >= 80 },
    language: lang,
  });
});

exports.health = asyncHandler(async (_req, res) => {
  const llmHealth = await llm.isHealthy();
  ok(res, { llm: llmHealth, hf: hf.isHealthy?.() || false });
});
