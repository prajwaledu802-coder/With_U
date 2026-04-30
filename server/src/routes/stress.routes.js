const router = require('express').Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/stress.controller');

router.post('/compute', optionalAuth, ctrl.compute);
router.get('/recent', optionalAuth, ctrl.recent);
router.get('/daily', optionalAuth, ctrl.daily);

module.exports = router;
