const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/helpers');
const stressService = require('../services/stress.service');

exports.compute = asyncHandler(async (req, res) => {
  const { signals = {}, sentimentScore = 0 } = req.body || {};
  const r = stressService.compute(signals, sentimentScore);
  if (req.user) {
    await stressService.log(req.user._id, {
      score: r.total,
      level: r.level,
      breakdown: r.breakdown,
      source: req.body?.source || 'text',
      triggeredSOS: r.total >= 80,
    });
  }
  ok(res, r);
});

exports.recent = asyncHandler(async (req, res) => {
  if (!req.user) return ok(res, { items: [] });
  const items = await stressService.recent(req.user._id);
  ok(res, { items });
});

exports.daily = asyncHandler(async (req, res) => {
  if (!req.user) return ok(res, { items: [] });
  const days = Math.min(parseInt(req.query.days, 10) || 14, 60);
  const items = await stressService.dailyAggregate(req.user._id, days);
  ok(res, { items, days });
});
