const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Log = require('../models/Log');
const {
  analyzeText,
  buildGentleResponse,
  buildSuggestions,
} = require('../services/sentimentService');
const { upsertDailySentiment } = require('../services/dailyAggregateService');
const { maybeTriggerGentleReach } = require('./gentleReachController');

exports.createLog = asyncHandler(async (req, res) => {
  const { content, type = 'text', language, transcript, audioUrl, metadata } = req.body || {};
  if (!content || !content.trim()) throw new ApiError(400, 'content is required');

  const lang = language || req.user.settings?.language || 'en';
  const analysis = analyzeText(content);

  const log = await Log.create({
    user: req.user._id,
    type,
    content: content.trim(),
    transcript: transcript || null,
    audioUrl: audioUrl || null,
    language: lang,
    sentimentScore: analysis.score,
    sentimentLabel: analysis.label,
    keywords: analysis.keywords,
    stressIndicators: analysis.stressIndicators,
    metadata: metadata || {},
  });

  await upsertDailySentiment(req.user._id);

  const reply = buildGentleResponse(analysis, lang);
  const suggestions = buildSuggestions(analysis, lang);

  maybeTriggerGentleReach(req.user._id).catch(() => {});

  res.status(201).json({
    success: true,
    log,
    response: { message: reply, suggestions, analysis },
  });
});

exports.listLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
  const skip = parseInt(req.query.skip, 10) || 0;
  const filter = { user: req.user._id };
  if (req.query.type) filter.type = req.query.type;

  const [items, total] = await Promise.all([
    Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Log.countDocuments(filter),
  ]);
  res.json({ success: true, items, total, limit, skip });
});

exports.getLog = asyncHandler(async (req, res) => {
  const log = await Log.findOne({ _id: req.params.id, user: req.user._id });
  if (!log) throw new ApiError(404, 'Log not found');
  res.json({ success: true, log });
});

exports.deleteLog = asyncHandler(async (req, res) => {
  const log = await Log.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!log) throw new ApiError(404, 'Log not found');
  await upsertDailySentiment(req.user._id, log.createdAt);
  res.json({ success: true, message: 'Removed' });
});
