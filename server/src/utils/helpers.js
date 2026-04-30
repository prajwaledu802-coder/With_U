const { STRESS, STRESS_LEVEL } = require('./constants');

const clamp = (value, min = 0, max = 100) =>
  Math.min(max, Math.max(min, Number.isFinite(Number(value)) ? Number(value) : min));

const classifyStressLevel = (score) => {
  const s = clamp(score, 0, 100);
  if (s <= STRESS.LOW.max) return STRESS_LEVEL.LOW;
  if (s <= STRESS.MODERATE.max) return STRESS_LEVEL.MODERATE;
  if (s <= STRESS.HIGH.max) return STRESS_LEVEL.HIGH;
  return STRESS_LEVEL.CRITICAL;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const safeJsonParse = (raw, fallback = null) => {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
};

const stripCodeFences = (text = '') =>
  String(text).replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

const minutesToHHMM = (m) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

const ok = (res, data = {}, code = 200) =>
  res.status(code).json({ success: true, ...data });

const fail = (res, message = 'Error', code = 400, extra = {}) =>
  res.status(code).json({ success: false, message, ...extra });

module.exports = {
  clamp,
  classifyStressLevel,
  sleep,
  safeJsonParse,
  stripCodeFences,
  minutesToHHMM,
  todayKey,
  ok,
  fail,
};
