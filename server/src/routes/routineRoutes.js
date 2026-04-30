const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/routineController');

router.post('/generate', protect, ctrl.generate);
router.get('/', protect, ctrl.get);

module.exports = router;
