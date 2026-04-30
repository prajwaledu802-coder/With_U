const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/airaController');

router.post('/context', protect, ctrl.context);

module.exports = router;
