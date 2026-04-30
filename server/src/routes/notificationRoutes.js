const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notificationController');

router.get('/status', protect, ctrl.status);
router.post('/test', protect, ctrl.test);
router.post('/send', protect, ctrl.send);

module.exports = router;
