const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAttendance)
  .post(markAttendance);

router.get('/summary', getAttendanceSummary);

module.exports = router;
