const router = require('express').Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/companionController');

router.post('/analyze-text', optionalAuth, ctrl.analyzeText);
router.post('/analyze-frame', optionalAuth, ctrl.analyzeFrame);
router.post('/speak', optionalAuth, ctrl.speak);
router.post('/navigate', optionalAuth, ctrl.navigate);

module.exports = router;
