const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/helpers');
const dashboardService = require('../services/dashboard.service');

exports.overview = asyncHandler(async (req, res) => {
  const r = await dashboardService.getOverview(req.user._id);
  ok(res, r);
});

exports.streak = asyncHandler(async (req, res) => {
  const r = await dashboardService.getDailyStreak(req.user._id);
  ok(res, { days: r });
});
