const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/logController');

router.post('/', protect, ctrl.createLog);
router.get('/', protect, ctrl.listLogs);
router.get('/:id', protect, ctrl.getLog);
router.delete('/:id', protect, ctrl.deleteLog);

module.exports = router;
