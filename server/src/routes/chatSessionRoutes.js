const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/chatSessionController');

router.get('/', protect, ctrl.list);
router.post('/', protect, ctrl.create);
router.get('/:id', protect, ctrl.get);
router.post('/:id/messages', protect, ctrl.appendMessages);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;
