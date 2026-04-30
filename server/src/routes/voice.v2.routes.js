const router = require('express').Router();
const multer = require('multer');
const { optionalAuth } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/voice.v2.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post('/tts', optionalAuth, ctrl.tts);
router.post('/stt', optionalAuth, upload.single('audio'), ctrl.stt);
router.get('/voices', ctrl.voices);

module.exports = router;
