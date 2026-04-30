/**
 * v2 API mount — clean module-per-route layout.
 *   /api/v2/conversation
 *   /api/v2/emotion
 *   /api/v2/stress
 *   /api/v2/recommendation
 *   /api/v2/call
 *   /api/v2/voice
 *   /api/v2/dashboard
 *   /api/v2/auth        → reuses existing auth controller
 *   /api/v2/user        → reuses existing user controller
 *   /api/v2/lang        → list supported languages
 */
const router = require('express').Router();

const { LANGUAGES, HELPLINES_IN } = require('../utils/constants');

router.use('/auth', require('./authRoutes'));
router.use('/user', require('./userRoutes'));
router.use('/conversation', require('./conversation.routes'));
router.use('/emotion', require('./emotion.routes'));
router.use('/stress', require('./stress.routes'));
router.use('/recommendation', require('./recommendation.routes'));
router.use('/call', require('./call.routes'));
router.use('/voice', require('./voice.v2.routes'));
router.use('/dashboard', require('./dashboard.v2.routes'));

router.get('/lang', (_req, res) => res.json({ success: true, languages: LANGUAGES }));
router.get('/helplines', (_req, res) => res.json({ success: true, items: HELPLINES_IN }));

router.get('/', (_req, res) =>
  res.json({
    success: true,
    name: 'Aira API v2',
    modules: ['conversation', 'emotion', 'stress', 'recommendation', 'call', 'voice', 'dashboard', 'auth', 'user', 'lang', 'helplines'],
  })
);

module.exports = router;
