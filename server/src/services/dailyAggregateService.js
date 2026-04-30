const Log = require('../models/Log');
const Sentiment = require('../models/Sentiment');
const { computeStressLevel, labelFor } = require('./sentimentService');

const startOfDayUTC = (d = new Date()) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const endOfDayUTC = (d = new Date()) => {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
};

const upsertDailySentiment = async (userId, date = new Date()) => {
  const day = startOfDayUTC(date);
  const end = endOfDayUTC(date);

  const logs = await Log.find({ user: userId, createdAt: { $gte: day, $lte: end } }).lean();
  if (!logs.length) {
    await Sentiment.findOneAndDelete({ user: userId, date: day });
    return null;
  }

  const avg = logs.reduce((a, b) => a + (b.sentimentScore || 0), 0) / logs.length;
  const stressLevel = computeStressLevel(logs);
  const label = labelFor(avg);

  const doc = await Sentiment.findOneAndUpdate(
    { user: userId, date: day },
    {
      averageScore: Math.round(avg * 100) / 100,
      label,
      entryCount: logs.length,
      stressLevel,
      summary: '',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc;
};

const getRecentSentiments = async (userId, days = 14) => {
  const since = startOfDayUTC(new Date(Date.now() - days * 86400000));
  return Sentiment.find({ user: userId, date: { $gte: since } })
    .sort({ date: -1 })
    .lean();
};

module.exports = { upsertDailySentiment, getRecentSentiments, startOfDayUTC, endOfDayUTC };
