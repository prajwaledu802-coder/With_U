/**
 * Lightweight analytics roll-up: counts per-day events for the dashboard.
 * Stores nothing extra — we just keep the most recent counts in the in-memory
 * cache so the dashboard endpoint stays snappy.
 */
const cache = require('../config/redis');
const Activity = require('../models/activity.model');
const logger = require('../utils/logger');

const runOnce = async () => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const docs = await Activity.find({ createdAt: { $gte: since } }).lean();
    const counts = {};
    for (const d of docs) {
      counts[d.kind] = (counts[d.kind] || 0) + 1;
    }
    await cache.set('analytics:weekly', counts, 60 * 60);
    logger.info('[job:analytics] weekly counts:', JSON.stringify(counts));
  } catch (err) {
    logger.warn('[job:analytics] failed:', err.message);
  }
};

const start = () => {
  setInterval(runOnce, 30 * 60 * 1000);
  logger.info('[job:analytics] scheduled (30 min)');
};

module.exports = { start, runOnce };
