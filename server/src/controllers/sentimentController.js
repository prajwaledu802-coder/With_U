const asyncHandler = require('../utils/asyncHandler');
const Sentiment = require('../models/Sentiment');
const { analyzeText, detectStressTrend } = require('../services/sentimentService');
const { getRecentSentiments } = require('../services/dailyAggregateService');

exports.analyzeOnly = asyncHandler(async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ success: false, message: 'text required' });
  const result = analyzeText(text);
  res.json({ success: true, result });
});

exports.history = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 14, 90);
  const items = await getRecentSentiments(req.user._id, days);
  res.json({ success: true, items });
});

exports.trend = asyncHandler(async (req, res) => {
  const items = await Sentiment.find({ user: req.user._id })
    .sort({ date: -1 })
    .limit(7)
    .lean();
  const trend = detectStressTrend(items);
  res.json({ success: true, trend, recent: items });
});
