const router = require('express').Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middlewares/validate.middleware');
const ctrl = require('../controllers/conversation.controller');

router.get('/health', ctrl.health);
router.post('/start', protect, ctrl.start);
router.get('/', protect, ctrl.list);
router.get('/:id', protect, ctrl.get);
router.post(
  '/send',
  optionalAuth,
  validate({ body: { text: { type: 'string', required: true, min: 1, max: 4000 } } }),
  ctrl.send
);
router.post('/:id/archive', protect, ctrl.archive);
router.delete('/:id', protect, ctrl.remove);

module.exports = router;
