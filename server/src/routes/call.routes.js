const router = require('express').Router();
const { optionalAuth, protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/call.controller');

router.get('/helplines', optionalAuth, ctrl.helplines);
router.post('/sos', protect, ctrl.sos);
router.post('/start', protect, ctrl.startCall);
router.post('/call-ai', protect, ctrl.callAI);
router.post('/call-contact', protect, ctrl.callContact);
router.post('/call-aira', protect, ctrl.callAira);

module.exports = router;
