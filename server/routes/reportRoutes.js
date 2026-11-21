const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('super_admin', 'academy_admin'), getReports);

module.exports = router;
