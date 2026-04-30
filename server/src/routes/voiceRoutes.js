const router = require('express').Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { voiceLimiter } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/voiceController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.use(voiceLimiter);
router.post('/tts', protect, ctrl.tts);
router.post('/stt', protect, upload.single('audio'), ctrl.stt);
router.get('/voices', protect, ctrl.voices);

module.exports = router;
