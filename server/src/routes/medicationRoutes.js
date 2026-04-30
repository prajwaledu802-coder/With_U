const router = require('express').Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/medicationController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// Public route — email confirmation link (no auth needed)
router.get('/confirm', ctrl.confirmEmail);

router.get('/', protect, ctrl.list);
router.post('/', protect, ctrl.create);
router.get('/due', protect, ctrl.due);
router.get('/canonical-mobile', protect, ctrl.canonicalMobile);
router.post('/parse', protect, upload.single('file'), ctrl.parse);
router.put('/:id', protect, ctrl.update);
router.delete('/:id', protect, ctrl.remove);
router.post('/:id/taken', protect, ctrl.markTaken);
router.post('/:id/remind', protect, ctrl.remindNow);
router.post('/:id/ack', protect, ctrl.acknowledgeReminder);
router.post('/:id/resend-confirm', protect, ctrl.resendConfirmation);

module.exports = router;
