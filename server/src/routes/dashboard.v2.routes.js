const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/dashboard.v2.controller');

router.get('/overview', protect, ctrl.overview);
router.get('/streak', protect, ctrl.streak);

module.exports = router;
