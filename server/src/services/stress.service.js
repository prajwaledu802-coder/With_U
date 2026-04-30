const StressEntry = require('../models/stress.model');
const stressEngine = require('../ai/stress.engine');

const compute = (signals, sentimentScore) => stressEngine.computeWeighted(signals, sentimentScore);

const log = async (userId, payload) => {
  if (!userId) return null;
  return StressEntry.create({ user: userId, ...payload });
};

const recent = async (userId, limit = 50) =>
  StressEntry.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();

const dailyAggregate = async (userId, days = 14) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const items = await StressEntry.find({ user: userId, createdAt: { $gte: since } }).lean();
  const buckets = new Map();
  for (const i of items) {
    const key = i.createdAt.toISOString().slice(0, 10);
    if (!buckets.has(key)) buckets.set(key, { date: key, total: 0, n: 0, peak: 0 });
    const b = buckets.get(key);
    b.total += i.score;
    b.n += 1;
    if (i.score > b.peak) b.peak = i.score;
  }
  return Array.from(buckets.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((b) => ({ date: b.date, avg: Math.round(b.total / b.n), peak: b.peak, samples: b.n }));
};

module.exports = { compute, log, recent, dailyAggregate };
