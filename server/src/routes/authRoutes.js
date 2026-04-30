const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/authController');

router.use(authLimiter);
router.post('/sync', protect, ctrl.syncUser);
router.get('/me', protect, ctrl.me);
router.post('/onboarding/complete', protect, ctrl.completeOnboarding);
router.delete('/account', protect, ctrl.deleteAccount);

module.exports = router;
