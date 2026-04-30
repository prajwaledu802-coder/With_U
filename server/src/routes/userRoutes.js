const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/userController');

router.put('/profile', protect, ctrl.updateProfile);
router.get('/settings', protect, ctrl.getSettings);
router.put('/settings', protect, ctrl.updateSettings);

module.exports = router;
