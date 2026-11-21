const express = require('express');
const router = express.Router();
const {
  getCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach
} = require('../controllers/coachController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCoaches)
  .post(authorize('super_admin', 'academy_admin'), createCoach);

router.route('/:id')
  .get(getCoachById)
  .put(authorize('super_admin', 'academy_admin'), updateCoach)
  .delete(authorize('super_admin', 'academy_admin'), deleteCoach);

module.exports = router;
