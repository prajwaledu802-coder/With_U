const asyncHandler = require('../utils/asyncHandler');

/**
 * Emotion → stress mapping
 */
const STRESS_MAP = {
  happy:     { min: 10, max: 20 },
  neutral:   { min: 20, max: 30 },
  surprised: { min: 40, max: 50 },
  sad:       { min: 60, max: 70 },
  disgusted: { min: 70, max: 85 },
  angry:     { min: 80, max: 90 },
  fearful:   { min: 80, max: 95 },
};

const MESSAGES = {
  low: [
    "You look calm today. Keep taking care of yourself. 🌿",
    "You're radiating positive energy right now. That's wonderful. ✨",
    "Everything seems peaceful. Enjoy this moment. 🌸",
    "You seem relaxed and at ease. That's great to see. 💚",
    "Your calm energy is beautiful. Keep nurturing it. 🍃",
  ],
  medium: [
    "You seem a little tired. Want a quick reset? 🌤️",
    "I notice some tension. How about a short breathing exercise? 💛",
    "Things might feel a bit heavy. Let's lighten the load together. 🌻",
    "You look like you could use a small break. I'm here for you. ☕",
    "A little stressed? That's okay. Let's try something calming. 🌊",
  ],
  high: [
    "I can sense you might be stressed. Let's take a moment to relax together. ❤️",
    "Hey… I'm here. Let's slow down and breathe for a moment. 🫁",
    "I can see things feel intense right now. You're not alone. 💜",
    "It looks like you're carrying a lot. Let's ease some of that weight. 🌙",
    "Take a deep breath with me. In… and out. You've got this. 🌿",
  ],
};

const SUGGESTIONS = {
  low: {
    title: "Keep the Positivity Going",
    items: [
      { icon: '🙏', text: 'Write one thing you\'re grateful for', type: 'gratitude' },
      { icon: '✨', text: 'Share a kind word with someone', type: 'affirmation' },
      { icon: '🎵', text: 'Listen to your favorite song', type: 'music' },
    ],
  },
  medium: {
    title: "Small Resets That Help",
    items: [
      { icon: '📝', text: 'Quick 2-minute journal entry', type: 'journal' },
      { icon: '🧘', text: 'Try a gentle stretch', type: 'stretch' },
      { icon: '🎮', text: 'Play a light focus game', type: 'game' },
      { icon: '🫁', text: 'Try 4-7-8 breathing', type: 'breathing' },
    ],
  },
  high: {
    title: "Calming Tools for You",
    items: [
      { icon: '🫁', text: 'Guided breathing exercise', type: 'breathing' },
      { icon: '🎶', text: 'Calming nature sounds', type: 'music' },
      { icon: '🧘', text: 'Short meditation (2 min)', type: 'meditation' },
      { icon: '💬', text: 'Talk to AI Companion', type: 'companion' },
    ],
  },
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * POST /api/mood/analyze
 * Body: { emotion, confidence }
 */
exports.analyze = asyncHandler(async (req, res) => {
  const { emotion, confidence = 0.5 } = req.body || {};

  const key = (emotion || 'neutral').toLowerCase();
  const range = STRESS_MAP[key] || STRESS_MAP.neutral;

  // Calculate stress with some variance based on confidence
  const base = range.min + (range.max - range.min) * Math.min(confidence, 1);
  const stress = Math.round(Math.max(0, Math.min(100, base)));

  // Determine level
  let level = 'low';
  if (stress > 60) level = 'high';
  else if (stress > 30) level = 'medium';

  const message = pick(MESSAGES[level]);
  const suggestions = SUGGESTIONS[level];

  res.json({
    success: true,
    emotion: key,
    confidence: Math.round(confidence * 100) / 100,
    stress,
    level,
    message,
    suggestions,
    color: level === 'low' ? '#22c55e' : level === 'medium' ? '#eab308' : '#ef4444',
  });
});

/**
 * GET /api/mood/config
 * Returns stress mapping config for client-side fallback
 */
exports.config = asyncHandler(async (_req, res) => {
  res.json({ success: true, stressMap: STRESS_MAP, messages: MESSAGES });
});
