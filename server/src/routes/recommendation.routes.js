const router = require('express').Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/recommendation.controller');

router.post('/suggest', optionalAuth, ctrl.suggest);
router.get('/playlist', ctrl.playlist);
router.get('/games', ctrl.games);

module.exports = router;
