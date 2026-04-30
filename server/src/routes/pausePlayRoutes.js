const router = require('express').Router();

/* ─── Pause & Play: returns game list ─── */
router.post('/', (_req, res) => {
  res.json({
    feature: 'pause_play',
    action: 'open',
    message: "Let's take a light break.",
    ui: { openModal: true, type: 'pause_play' },
    games: [
      { id: 'bubble', name: 'Bubble Pop', desc: 'Pop colorful bubbles to unwind.', icon: '🫧', url: '/app/games' },
      { id: 'memory', name: 'Memory Match', desc: 'A gentle pattern game.', icon: '🧩', url: '/app/games' },
      { id: 'puzzle', name: 'Calm Puzzle', desc: 'Slide tiles at your own pace.', icon: '🧊', url: '/app/games' },
    ],
  });
});

module.exports = router;
