/**
 * Stress engine — combines multiple signals into a single 0-100 score.
 * Weights match the front-end PRD: sentiment 0.40, typing 0.18,
 * session 0.14, late-night 0.14, interaction-drop 0.14.
 */
const { clamp, classifyStressLevel } = require('../utils/helpers');

const deriveSignals = (signals = {}) => {
  const d = { ...signals };
  if (d.session_duration_factor == null) {
    const mins = Number(d.session_duration || 0);
    d.session_duration_factor = mins >= 120 ? 80 : mins >= 60 ? 60 : 0;
  }
  if (d.late_night_factor == null) {
    d.late_night_factor = d.time_of_day === 'late_night' ? 70 : 0;
  }
  if (d.typing_instability == null) {
    if (d.typing_pattern === 'erratic') d.typing_instability = 70;
    else if (d.typing_pattern === 'paused') d.typing_instability = 55;
    else d.typing_instability = 10;
  }
  if (d.interaction_drop == null) {
    const gap = Number(d.inactivity_gaps || 0);
    d.interaction_drop = gap >= 300 ? 80 : gap >= 120 ? 60 : 0;
  }
  return d;
};

const computeWeighted = (signals = {}, sentimentScore = 0) => {
  const d = deriveSignals({ ...signals, sentiment_score: clamp(sentimentScore) });
  const total = Math.round(
    clamp(
      clamp(d.sentiment_score) * 0.40 +
      clamp(d.typing_instability) * 0.18 +
      clamp(d.session_duration_factor) * 0.14 +
      clamp(d.late_night_factor) * 0.14 +
      clamp(d.interaction_drop) * 0.14,
      0,
      100
    )
  );
  return {
    total,
    level: classifyStressLevel(total),
    breakdown: {
      sentiment: clamp(d.sentiment_score),
      typing: clamp(d.typing_instability),
      session: clamp(d.session_duration_factor),
      lateNight: clamp(d.late_night_factor),
      interaction: clamp(d.interaction_drop),
    },
    signals: d,
  };
};

const fuse = (textScore, voiceScore, faceScore) => {
  const parts = [textScore, voiceScore, faceScore].filter((s) => Number.isFinite(s));
  if (!parts.length) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
};

module.exports = { deriveSignals, computeWeighted, fuse };
