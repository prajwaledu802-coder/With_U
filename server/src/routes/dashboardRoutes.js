const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/dashboardController');

router.get('/summary', protect, ctrl.summary);
router.get('/stats', protect, ctrl.stats);

module.exports = router;
