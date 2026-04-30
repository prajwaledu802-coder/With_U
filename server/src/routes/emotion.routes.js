const router = require('express').Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/emotion.controller');

router.post('/text', optionalAuth, ctrl.analyseText);
router.post('/frame', optionalAuth, ctrl.analyseFrame);
router.post('/fuse', optionalAuth, ctrl.fuse);
router.get('/recent', optionalAuth, ctrl.recent);

module.exports = router;
