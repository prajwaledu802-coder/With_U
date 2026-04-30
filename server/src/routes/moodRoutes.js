const router = require('express').Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/moodController');

router.post('/analyze', optionalAuth, ctrl.analyze);
router.get('/config', ctrl.config);

module.exports = router;
