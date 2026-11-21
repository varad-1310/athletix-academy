const express = require('express');
const router = express.Router();
const { resetDemo, getDemoStatus } = require('../controllers/demoController');
const { protect, authorize } = require('../middleware/auth');

router.get('/status', getDemoStatus);
router.post('/reset', protect, authorize('super_admin', 'academy_admin'), resetDemo);

module.exports = router;
