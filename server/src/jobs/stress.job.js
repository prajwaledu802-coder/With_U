/**
 * Daily stress aggregation.
 * Buckets the previous day's per-message stress into a single Sentiment row.
 */
const cron = (fn, ms) => setInterval(fn, ms);
const StressEntry = require('../models/stress.model');
const Sentiment = require('../models/Sentiment');
const logger = require('../utils/logger');

const runOnce = async () => {
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 1);
    const until = new Date(since);
    until.setDate(until.getDate() + 1);

    const items = await StressEntry.find({ createdAt: { $gte: since, $lt: until } }).lean();
    const grouped = new Map();
    for (const i of items) {
      if (!grouped.has(String(i.user))) grouped.set(String(i.user), []);
      grouped.get(String(i.user)).push(i);
    }
    for (const [userId, entries] of grouped) {
      const avg = Math.round(entries.reduce((a, b) => a + b.score, 0) / entries.length);
      const peak = entries.reduce((a, b) => Math.max(a, b.score), 0);
      const dateKey = since;
      await Sentiment.findOneAndUpdate(
        { user: userId, date: dateKey },
        {
          user: userId,
          date: dateKey,
          stressLevel: avg,
          averageScore: avg,
          peakScore: peak,
          entryCount: entries.length,
          label: avg <= 20 ? 'calm' : avg <= 50 ? 'mild' : avg <= 80 ? 'high' : 'critical',
        },
        { upsert: true, new: true }
      );
    }
    logger.info(`[job:stress] aggregated ${grouped.size} user(s) for ${since.toISOString().slice(0, 10)}`);
  } catch (err) {
    logger.warn('[job:stress] failed:', err.message);
  }
};

const start = () => {
  // Run once an hour; cheap and idempotent
  cron(runOnce, 60 * 60 * 1000);
  logger.info('[job:stress] scheduled (hourly)');
};

module.exports = { start, runOnce };
