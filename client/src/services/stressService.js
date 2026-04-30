/**
 * Invisible Stress Detection Service
 * 
 * Tracks stress indicators WITHOUT camera or intrusive measures:
 * 1. Session duration (how long the user has been on the site)
 * 2. Time of day (late night usage = higher baseline stress)
 * 3. Message sentiment (analyzed via backend/Gemini)
 * 4. Typing patterns (speed, deletions, pauses)
 * 5. Screen time tracking (daily usage patterns)
 */

const STORAGE_KEY = 'withu_stress_data';

/* ═══ Time-of-day helpers ═══ */
function getTimeOfDayLabel(now = new Date()) {
  const d = now instanceof Date ? now : new Date(now);
  const hour = d.getHours();
  if (hour >= 23 || hour < 4) return 'late_night';
  if (hour < 12) return 'morning';
  return 'afternoon';
}

function getLateNightFactor(now = new Date()) {
  const label = getTimeOfDayLabel(now);
  return label === 'late_night' ? 70 : 0;
}

function getTimeStress(now = new Date()) {
  return getLateNightFactor(now);
}

/* ═══ Session duration helpers ═══ */
function getSessionDurationMinutes(sessionStartTime, now = Date.now()) {
  if (!sessionStartTime) return 0;
  const delta = now - sessionStartTime;
  return Math.max(0, delta / 60000);
}

function getSessionDurationFactor(sessionStartTime, now = Date.now()) {
  const mins = getSessionDurationMinutes(sessionStartTime, now);
  if (mins >= 120) return 80;
  if (mins >= 60) return 60;
  return 0;
}

function getSessionStress(sessionStartTime, now = Date.now()) {
  return getSessionDurationFactor(sessionStartTime, now);
}

/* ═══ Typing pattern analysis ═══ */
class TypingAnalyzer {
  constructor() {
    this.keyTimes = [];
    this.deleteCount = 0;
    this.totalKeys = 0;
    this.pauseStart = null;
    this.longPauses = 0; // pauses > 5s while typing
    this.charCount = 0;
  }

  recordKey(isDelete = false, delta = 1) {
    const now = Date.now();
    this.totalKeys++;
    if (!isDelete) this.charCount += Math.max(0, delta || 1);

    if (isDelete) {
      this.deleteCount++;
    }

    // Detect long pauses
    if (this.keyTimes.length > 0) {
      const lastKey = this.keyTimes[this.keyTimes.length - 1];
      if (now - lastKey > 5000) {
        this.longPauses++;
      }
    }

    this.keyTimes.push(now);

    // Keep only last 50 key times
    if (this.keyTimes.length > 50) {
      this.keyTimes = this.keyTimes.slice(-50);
    }
  }

  getTypingSpeed() {
    if (this.keyTimes.length < 2) return 0;
    const duration = (this.keyTimes[this.keyTimes.length - 1] - this.keyTimes[0]) / 1000;
    if (duration <= 0) return 0;
    return Math.round((this.charCount / duration) * 10) / 10;
  }

  getPattern() {
    if (this.totalKeys < 5) return 'stable';
    const deleteRatio = this.deleteCount / this.totalKeys;
    if (this.longPauses > 1) return 'paused';
    if (deleteRatio > 0.3) return 'erratic';
    if (this.keyTimes.length >= 10) {
      const intervals = [];
      for (let i = 1; i < this.keyTimes.length; i++) {
        intervals.push(this.keyTimes[i] - this.keyTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval < 80 || avgInterval > 800) return 'erratic';
    }
    return 'stable';
  }

  getInstability() {
    if (this.totalKeys < 5) return 0;

    let score = 0;

    // High delete ratio = frustration/anxiety
    const deleteRatio = this.deleteCount / this.totalKeys;
    if (deleteRatio > 0.4) score += 40;
    else if (deleteRatio > 0.25) score += 25;

    // Long pauses = hesitation/overwhelm
    if (this.longPauses > 3) score += 30;
    else if (this.longPauses > 1) score += 15;

    // Rapid typing = agitation
    if (this.keyTimes.length >= 10) {
      const intervals = [];
      for (let i = 1; i < this.keyTimes.length; i++) {
        intervals.push(this.keyTimes[i] - this.keyTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval < 80 || avgInterval > 800) score += 20;
    }

    return Math.min(100, score);
  }

  reset() {
    this.keyTimes = [];
    this.deleteCount = 0;
    this.totalKeys = 0;
    this.longPauses = 0;
    this.charCount = 0;
  }
}

/* ═══ Screen time tracker ═══ */
function getStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function trackScreenTime(trackingEnabled = true) {
  if (!trackingEnabled) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const data = getStoredData();

  if (!data.dailyUsage) data.dailyUsage = {};
  if (!data.dailyUsage[today]) data.dailyUsage[today] = 0;

  // Add 1 minute
  data.dailyUsage[today] += 1;

  // Keep only last 7 days
  const keys = Object.keys(data.dailyUsage).sort();
  if (keys.length > 7) {
    keys.slice(0, keys.length - 7).forEach((k) => delete data.dailyUsage[k]);
  }

  saveData(data);
  return data.dailyUsage[today];
}

function getDailyScreenTimeStress() {
  const today = new Date().toISOString().slice(0, 10);
  const data = getStoredData();
  const mins = data.dailyUsage?.[today] || 0;

  // > 3 hours today = significant stress indicator
  if (mins > 180) return 20;
  if (mins > 120) return 12;
  if (mins > 60) return 5;
  return 0;
}

function getWeeklyPattern() {
  const data = getStoredData();
  if (!data.dailyUsage) return [];

  return Object.entries(data.dailyUsage)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, mins]) => ({ date, minutes: mins }));
}

function getInteractionDropFactor(lastEmotionalAt, lastInteractionAt, now = Date.now()) {
  if (!lastEmotionalAt || !lastInteractionAt) return 0;
  const gapMs = now - lastInteractionAt;
  if (gapMs >= 300000) return 80;
  if (gapMs >= 120000) return 60;
  if (gapMs >= 60000) return 30;
  return 0;
}

/* ═══ Combined stress calculator (PRD weights) ═══ */
function calculateInvisibleStress(sessionStart, typingAnalyzer, lastMessageStress = 0, options = {}) {
  const trackingEnabled = options.trackingEnabled !== false;
  const now = options.now || Date.now();

  const sentimentScore = Math.min(100, Math.max(0, lastMessageStress || 0));
  const lateNightFactor = trackingEnabled ? getLateNightFactor(new Date(now)) : 0;
  const sessionFactor = trackingEnabled ? getSessionDurationFactor(sessionStart, now) : 0;
  const typingInstability = trackingEnabled && typingAnalyzer ? typingAnalyzer.getInstability() : 0;
  const interactionDrop = trackingEnabled
    ? getInteractionDropFactor(options.lastEmotionalAt, options.lastInteractionAt, now)
    : 0;

  const weighted = Math.round(
    sentimentScore * 0.35 +
    typingInstability * 0.2 +
    sessionFactor * 0.15 +
    lateNightFactor * 0.15 +
    interactionDrop * 0.15
  );

  // Crisis floor: if the backend returned a high sentiment/stress score (crisis),
  // never let the blended total dilute it below the sentiment score.
  // This prevents "I want to kill myself" from showing 20% stress.
  const total = sentimentScore >= 85
    ? Math.max(weighted, sentimentScore)
    : weighted;

  const sessionMinutes = getSessionDurationMinutes(sessionStart, now);
  const interactionFrequency = trackingEnabled && sessionMinutes > 0
    ? Math.round((options.interactionCount || 0) / sessionMinutes * 100) / 100
    : 0;
  const inactivityGaps = trackingEnabled && options.lastInteractionAt
    ? Math.round((now - options.lastInteractionAt) / 1000)
    : 0;
  const typingSpeed = trackingEnabled && typingAnalyzer?.getTypingSpeed
    ? typingAnalyzer.getTypingSpeed()
    : 0;
  const typingPattern = trackingEnabled && typingAnalyzer?.getPattern
    ? typingAnalyzer.getPattern()
    : 'stable';

  return {
    total: Math.min(100, Math.max(0, total)),
    breakdown: {
      sentiment: sentimentScore,
      typing: typingInstability,
      session: sessionFactor,
      lateNight: lateNightFactor,
      interaction: interactionDrop,
    },
    signals: {
      typing_speed: typingSpeed,
      typing_pattern: typingPattern,
      session_duration: Math.round(sessionMinutes),
      time_of_day: getTimeOfDayLabel(now),
      inactivity_gaps: inactivityGaps,
      interaction_frequency: interactionFrequency,
      typing_instability: typingInstability,
      session_duration_factor: sessionFactor,
      late_night_factor: lateNightFactor,
      interaction_drop: interactionDrop,
    },
  };
}

/* ═══ Record a late-night session ═══ */
function recordLateNightSession(trackingEnabled = true) {
  if (!trackingEnabled) return;
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 4) {
    const data = getStoredData();
    if (!data.lateNights) data.lateNights = [];
    const today = new Date().toISOString().slice(0, 10);
    if (!data.lateNights.includes(today)) {
      data.lateNights.push(today);
      // Keep last 30
      if (data.lateNights.length > 30) data.lateNights = data.lateNights.slice(-30);
      saveData(data);
    }
  }
}

function getLateNightCount(days = 7) {
  const data = getStoredData();
  if (!data.lateNights) return 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return data.lateNights.filter((d) => new Date(d) >= cutoff).length;
}

export {
  TypingAnalyzer,
  trackScreenTime,
  calculateInvisibleStress,
  getTimeStress,
  getSessionStress,
  getTimeOfDayLabel,
  getSessionDurationMinutes,
  getSessionDurationFactor,
  getInteractionDropFactor,
  getWeeklyPattern,
  recordLateNightSession,
  getLateNightCount,
};
