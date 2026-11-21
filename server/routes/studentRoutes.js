const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getStudents)
  .post(authorize('super_admin', 'academy_admin'), createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(authorize('super_admin', 'academy_admin'), updateStudent)
  .delete(authorize('super_admin', 'academy_admin'), deleteStudent);

module.exports = router;
