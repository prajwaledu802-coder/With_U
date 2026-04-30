const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/sentimentController');

router.post('/analyze', protect, ctrl.analyzeOnly);
router.get('/history', protect, ctrl.history);
router.get('/trend', protect, ctrl.trend);

module.exports = router;
