const Activity = require('../models/activity.model');
const StressEntry = require('../models/stress.model');
const Conversation = require('../models/conversation.model');
const Sentiment = require('../models/Sentiment');
const Medication = require('../models/Medication');
const { todayKey } = require('../utils/helpers');

const getOverview = async (userId) => {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [stressEntries, conversations, activities, sentiments, meds] = await Promise.all([
    StressEntry.find({ user: userId, createdAt: { $gte: since } }).lean(),
    Conversation.find({ user: userId }).sort({ updatedAt: -1 }).limit(5).lean(),
    Activity.find({ user: userId, createdAt: { $gte: since } }).lean(),
    Sentiment.find({ user: userId }).sort({ date: -1 }).limit(14).lean(),
    Medication.find({ user: userId, active: true }).lean(),
  ]);

  const todayKeyValue = todayKey();
  const todayEntries = stressEntries.filter((e) => e.createdAt.toISOString().slice(0, 10) === todayKeyValue);
  const todayAvg = todayEntries.length
    ? Math.round(todayEntries.reduce((a, b) => a + b.score, 0) / todayEntries.length)
    : 0;
  const todayPeak = todayEntries.reduce((a, b) => Math.max(a, b.score), 0);

  const lateNights = activities.filter((a) => a.kind === 'late_night').length;
  const sosCount = activities.filter((a) => a.kind === 'sos').length;
  const sleepCount = activities.filter((a) => a.kind === 'sleep').length;

  const dailySeries = {};
  for (const e of stressEntries) {
    const k = e.createdAt.toISOString().slice(0, 10);
    if (!dailySeries[k]) dailySeries[k] = { date: k, total: 0, n: 0, peak: 0 };
    dailySeries[k].total += e.score;
    dailySeries[k].n += 1;
    if (e.score > dailySeries[k].peak) dailySeries[k].peak = e.score;
  }
  const series = Object.values(dailySeries)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date, avg: Math.round(d.total / d.n), peak: d.peak }));

  return {
    today: { avg: todayAvg, peak: todayPeak, samples: todayEntries.length },
    series,
    weekly: { lateNights, sosCount, sleepCount, sentiments },
    recentConversations: conversations.map((c) => ({
      id: c._id,
      title: c.title,
      updatedAt: c.updatedAt,
      lastStressScore: c.lastStressScore,
      messageCount: c.messages?.length || 0,
    })),
    medications: meds.map((m) => ({ id: m._id, name: m.name, dosage: m.dosage, times: m.times })),
  };
};

const getDailyStreak = async (userId) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const acts = await Activity.find({ user: userId, createdAt: { $gte: since } }).lean();
  const days = new Map();
  for (const a of acts) {
    const k = a.createdAt.toISOString().slice(0, 10);
    if (!days.has(k)) days.set(k, { date: k, sleep: 0, wake: 0, lateNight: 0, sos: 0 });
    const d = days.get(k);
    if (a.kind === 'sleep') d.sleep += a.durationMs || 0;
    if (a.kind === 'wake') d.wake += 1;
    if (a.kind === 'late_night') d.lateNight += 1;
    if (a.kind === 'sos') d.sos += 1;
  }
  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
};

module.exports = { getOverview, getDailyStreak };
