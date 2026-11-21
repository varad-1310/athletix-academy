const Attendance = require('../models/Attendance');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');

// @desc    Get attendance for a specific batch and date (or month)
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res, next) => {
  try {
    const { batchId, date, month, year, sport } = req.query;

    const query = {};
    if (batchId && batchId !== 'all') query.batch = batchId;
    if (sport && sport !== 'all') query.sport = sport;

    // Filter by specific date if provided
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('batch', 'name startTime endTime')
      .populate('records.student', 'studentId fullName avatar phone')
      .populate('markedBy', 'name role')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save / Mark attendance for a batch on a date
// @route   POST /api/attendance
// @access  Private (Admins and Coaches)
const markAttendance = async (req, res, next) => {
  try {
    const { batchId, date, records, sport, reason } = req.body;

    if (!batchId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide batchId, date, and student records array'
      });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Role validation: if coach, ensure assigned to this batch
    if (req.user.role === 'coach') {
      const isAssigned = batch.coach.toString() === req.user.coachProfile?.toString() ||
                         batch.coach.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are only allowed to mark attendance for your assigned batches'
        });
      }
    }

    // Validate that all students in records belong to this batch
    const enrolledStudents = await Student.find({ batch: batchId, status: 'active' }).select('_id');
    const enrolledIds = new Set(enrolledStudents.map(s => s._id.toString()));

    const invalidStudent = records.find(r => !enrolledIds.has(r.student.toString()));
    if (invalidStudent) {
      return res.status(400).json({
        success: false,
        message: `Student with ID ${invalidStudent.student} does not belong to batch "${batch.name}"`
      });
    }

    // Normalize date to midnight UTC/local
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists for this batch & date
    let attendance = await Attendance.findOne({
      batch: batchId,
      date: {
        $gte: new Date(attendanceDate.getTime()),
        $lte: new Date(attendanceDate.getTime() + 86400000 - 1)
      }
    });

    if (attendance) {
      // Update existing attendance record with audit trail
      attendance.records = records;
      attendance.markedBy = req.user._id;
      attendance.auditLog.push({
        action: 'UPDATE',
        modifiedBy: req.user._id,
        modifierName: req.user.name,
        reason: reason || 'Updated daily attendance',
        timestamp: new Date()
      });
      await attendance.save();

      return res.json({
        success: true,
        message: 'Attendance updated successfully with audit trail',
        data: attendance
      });
    }

    // Create new attendance record
    attendance = await Attendance.create({
      date: attendanceDate,
      sport: sport || batch.sport,
      batch: batchId,
      records,
      markedBy: req.user._id,
      auditLog: [{
        action: 'CREATE',
        modifiedBy: req.user._id,
        modifierName: req.user.name,
        reason: 'Initial daily attendance marking',
        timestamp: new Date()
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get batch attendance summary (Present %, counts)
// @route   GET /api/attendance/summary
// @access  Private
const getAttendanceSummary = async (req, res, next) => {
  try {
    const { batchId, startDate, endDate } = req.query;
    const query = {};
    if (batchId && batchId !== 'all') query.batch = batchId;

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendances = await Attendance.find(query).populate('records.student', 'studentId fullName');

    let totalRecorded = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    attendances.forEach(att => {
      att.records.forEach(r => {
        totalRecorded++;
        if (r.status === 'present') presentCount++;
        else if (r.status === 'absent') absentCount++;
        else if (r.status === 'late') lateCount++;
      });
    });

    const percentage = totalRecorded > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / totalRecorded) * 100) : 0;

    res.json({
      success: true,
      summary: {
        totalSessions: attendances.length,
        totalRecorded,
        presentCount,
        absentCount,
        lateCount,
        percentage
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  getAttendanceSummary
};
