const express = require('express');
const router = express.Router();
const { getSports, createSport, updateSport } = require('../controllers/sportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getSports);
router.post('/', protect, authorize('super_admin', 'academy_admin'), createSport);
router.put('/:id', protect, authorize('super_admin', 'academy_admin'), updateSport);

module.exports = router;
