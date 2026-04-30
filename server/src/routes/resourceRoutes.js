const router = require('express').Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/resourceController');

router.get('/', optionalAuth, ctrl.list);

module.exports = router;
