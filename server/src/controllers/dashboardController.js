const asyncHandler = require('../utils/asyncHandler');
const Log = require('../models/Log');
const Sentiment = require('../models/Sentiment');
const Medication = require('../models/Medication');
const { getRecentSentiments } = require('../services/dailyAggregateService');
const { detectStressTrend, buildSuggestions, buildGentleResponse } = require('../services/sentimentService');
const { enrichMedication } = require('../services/medicationService');

const greetingFor = (date, name, language = 'en') => {
  const h = date.getHours();
  if (language === 'hi') {
    if (h < 12) return `सुप्रभात, ${name || 'दोस्त'}`;
    if (h < 17) return `नमस्ते, ${name || 'दोस्त'}`;
    return `शुभ संध्या, ${name || 'दोस्त'}`;
  }
  if (h < 12) return `Good morning, ${name || 'friend'}`;
  if (h < 17) return `Good afternoon, ${name || 'friend'}`;
  return `Good evening, ${name || 'friend'}`;
};

exports.summary = asyncHandler(async (req, res) => {
  const user = req.user;
  const lang = user.settings?.language || 'en';

  const [sentiments, recentLogs, activeMeds] = await Promise.all([
    getRecentSentiments(user._id, 14),
    Log.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean(),
    Medication.find({ user: user._id, active: true }).sort({ updatedAt: -1 }).lean(),
  ]);

  const enrichedMeds = activeMeds.map(enrichMedication);
  const upcomingMed = enrichedMeds
    .filter((m) => m.nextDoseInMinutes != null && m.nextDoseInMinutes >= 0)
    .sort((a, b) => a.nextDoseInMinutes - b.nextDoseInMinutes)[0] || null;

  const trend = detectStressTrend(sentiments);
  const today = sentiments[0] || null;

  const aggregateIndicators = recentLogs.reduce(
    (acc, l) => {
      const s = l.stressIndicators || {};
      acc.exhaustion += s.exhaustion || 0;
      acc.overwhelm += s.overwhelm || 0;
      acc.isolation += s.isolation || 0;
      acc.worry += s.worry || 0;
      return acc;
    },
    { exhaustion: 0, overwhelm: 0, isolation: 0, worry: 0 }
  );

  const fakeAnalysis = {
    label: today?.label || 'neutral',
    stressIndicators: aggregateIndicators,
  };

  const greeting = greetingFor(new Date(), user.name, lang);
  const message = buildGentleResponse(fakeAnalysis, lang);
  const suggestions = buildSuggestions(fakeAnalysis, lang);

  res.json({
    success: true,
    greeting,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      language: lang,
      settings: user.settings,
    },
    today: today
      ? { stressLevel: today.stressLevel, label: today.label, entryCount: today.entryCount }
      : { stressLevel: 0, label: 'neutral', entryCount: 0 },
    trend,
    message,
    suggestions,
    recentLogs,
    sentimentSeries: sentiments
      .map((s) => ({
        date: s.date,
        stressLevel: s.stressLevel,
        averageScore: s.averageScore,
        label: s.label,
      }))
      .reverse(),
    medications: {
      total: enrichedMeds.length,
      list: enrichedMeds,
      next: upcomingMed,
    },
  });
});

exports.stats = asyncHandler(async (req, res) => {
  const totalLogs = await Log.countDocuments({ user: req.user._id });
  const totalDays = await Sentiment.countDocuments({ user: req.user._id });
  const avg = await Sentiment.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: null, avgStress: { $avg: '$stressLevel' }, avgScore: { $avg: '$averageScore' } } },
  ]);
  res.json({
    success: true,
    totalLogs,
    totalDays,
    averageStress: Math.round(avg[0]?.avgStress || 0),
    averageScore: Math.round((avg[0]?.avgScore || 0) * 100) / 100,
  });
});
