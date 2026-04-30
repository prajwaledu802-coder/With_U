/**
 * Decision engine — turns (stressLevel, tags, options) into the next UI action.
 * Mirrors the user-facing PRD:
 *   ≤ 20%  → suggest games / music / light
 *   21-50% → suggest chat / breathing / music
 *   51-80% → deep conversation / breathing / emotional support
 *   ≥ 80%  → trigger SOS support panel
 */
const { ACTIONS } = require('../utils/constants');

const selectFromTags = (tags = []) => {
  if (tags.includes('anxiety')) return ACTIONS.BREATHING;
  if (tags.includes('fatigue')) return ACTIONS.AUDIO;
  if (tags.includes('overload')) return ACTIONS.RESET;
  if (tags.includes('negative_thinking')) return ACTIONS.GRATITUDE;
  return null;
};

const decideAction = (stressLevel, tags = [], options = {}) => {
  if (options.forceQuiz) return ACTIONS.QUIZ;
  if (options.forceScreenTimeBreak) return ACTIONS.RESET;
  if (stressLevel === 'critical') return ACTIONS.EXTERNAL_HELP;
  if (stressLevel === 'high') return selectFromTags(tags) || ACTIONS.BREATHING;
  if (stressLevel === 'moderate') return selectFromTags(tags) || ACTIONS.AUDIO;
  if (stressLevel === 'low') return ACTIONS.NONE;
  return ACTIONS.NONE;
};

const getAnimation = (stressScore) => {
  if (stressScore <= 20) return 'nod';
  if (stressScore <= 50) return 'speaking';
  if (stressScore <= 80) return 'calming';
  return 'breathing';
};

const buildSuggestions = (stressLevel) => {
  const base = {
    low: [
      { icon: '🎮', label: 'Play a quick game', tool: 'games' },
      { icon: '🎵', label: 'Listen to music', tool: 'audio' },
      { icon: '☕', label: 'Take a light pause', tool: 'reset' },
    ],
    moderate: [
      { icon: '🌬️', label: '1-minute breathing', tool: 'breathing' },
      { icon: '🎧', label: 'Calming sounds', tool: 'audio' },
      { icon: '💬', label: 'Quick check-in', tool: 'quiz' },
    ],
    high: [
      { icon: '🌬️', label: 'Slow breathing', tool: 'breathing' },
      { icon: '✨', label: 'Gratitude moment', tool: 'gratitude' },
      { icon: '🧊', label: 'Quick reset', tool: 'reset' },
    ],
    critical: [
      { icon: '🌬️', label: 'Slow breathing', tool: 'breathing' },
      { icon: '📞', label: 'Call a trusted person', tool: 'contacts' },
      { icon: '🆘', label: 'Reach a helpline', tool: 'helpline' },
    ],
  };
  return base[stressLevel] || base.low;
};

const shouldTriggerSOS = (score) => Number(score) >= 80;

module.exports = { decideAction, getAnimation, buildSuggestions, shouldTriggerSOS };
