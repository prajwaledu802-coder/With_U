const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/gentleReachController');

router.post('/toggle', protect, ctrl.toggle);
router.post('/trigger', protect, ctrl.triggerManual);
router.get('/history', protect, ctrl.history);

module.exports = router;
