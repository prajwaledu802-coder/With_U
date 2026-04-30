const { buildSuggestions, decideAction } = require('../ai/decision.engine');
const { HELPLINES_IN, ACTIONS } = require('../utils/constants');
const TrustedContact = require('../models/TrustedContact');

const PLAYLIST = {
  calm: [
    { id: 'rain', title: 'Rain', desc: 'Gentle rainfall', url: '/rain.mpeg' },
    { id: 'piano', title: 'Soft Piano', desc: 'Slow piano keys', url: '/piano.mpeg' },
  ],
  upbeat: [
    { id: 'morning', title: 'Morning Light', desc: 'Soft uplifting', url: '/piano.mpeg' },
  ],
};

const GAMES = [
  { id: 'bubble', name: 'Bubble Pop', desc: 'Pop colourful bubbles to unwind', icon: '🫧', url: '/app/games' },
  { id: 'memory', name: 'Memory Match', desc: 'A gentle pattern game', icon: '🧩', url: '/app/games' },
  { id: 'puzzle', name: 'Calm Puzzle', desc: 'Slide tiles at your own pace', icon: '🧊', url: '/app/games' },
];

const buildRecommendation = async ({ userId, stressLevel = 'low', tags = [], options = {} }) => {
  const action = decideAction(stressLevel, tags, options);
  const suggestions = buildSuggestions(stressLevel);
  const playlist = stressLevel === 'low' ? PLAYLIST.upbeat : PLAYLIST.calm;
  const games = stressLevel === 'critical' ? [] : GAMES;

  let supports = null;
  if (stressLevel === 'high' || stressLevel === 'critical') {
    let contacts = [];
    if (userId) {
      contacts = await TrustedContact.find({ user: userId }).limit(3).lean();
    }
    supports = {
      trustedContacts: contacts.map((c) => ({ name: c.name, phone: c.phone, relation: c.relation })),
      helplines: HELPLINES_IN,
      aiCompanion: { label: 'Talk to Aira deeply', action: ACTIONS.QUIZ },
    };
  }

  return { action, stressLevel, suggestions, playlist, games, supports };
};

module.exports = { buildRecommendation, PLAYLIST, GAMES };
