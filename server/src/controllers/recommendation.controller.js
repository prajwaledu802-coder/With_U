const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/helpers');
const recommendation = require('../services/recommendation.service');

exports.suggest = asyncHandler(async (req, res) => {
  const stressLevel = req.body?.stressLevel || req.query.stressLevel || 'low';
  const tags = req.body?.tags || [];
  const userId = req.user?._id || null;
  const r = await recommendation.buildRecommendation({ userId, stressLevel, tags });
  ok(res, r);
});

exports.playlist = asyncHandler(async (_req, res) => {
  ok(res, { calm: recommendation.PLAYLIST.calm, upbeat: recommendation.PLAYLIST.upbeat });
});

exports.games = asyncHandler(async (_req, res) => {
  ok(res, { games: recommendation.GAMES });
});
