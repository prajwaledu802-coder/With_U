const router = require('express').Router();

const TOOLS = {
  breathing: {
    tool: 'breathing', action: 'start',
    message: "Let's take a slow breath.",
    ui: { openModal: true, type: 'breathing' },
  },
  audio: {
    tool: 'audio', action: 'start',
    message: 'Want to listen to something calming?',
    ui: { openModal: true, type: 'audio' },
  },
  reset: {
    tool: 'reset', action: 'start',
    message: 'A quick reset — just follow along.',
    ui: { openModal: true, type: 'reset' },
  },
  gratitude: {
    tool: 'gratitude', action: 'start',
    message: 'Name one small thing that felt okay today.',
    ui: { openModal: true, type: 'gratitude' },
  },
};

router.post('/', (req, res) => {
  const { tool } = req.body;
  const t = TOOLS[tool];
  if (!t) return res.json({ tool: 'none', action: 'idle', message: "I'm here when you need me.", ui: { openModal: false, type: 'none' } });
  res.json(t);
});

module.exports = router;
