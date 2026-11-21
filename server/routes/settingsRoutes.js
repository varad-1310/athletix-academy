const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, createFeePlan } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getSettings);
router.put('/', protect, authorize('super_admin'), updateSettings);
router.post('/fee-plans', protect, authorize('super_admin', 'academy_admin'), createFeePlan);

module.exports = router;
