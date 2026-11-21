const Student = require('../models/Student');
const Batch = require('../models/Batch');
const FeeInvoice = require('../models/FeeInvoice');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');
const { calculateStudentBalance } = require('../services/feeService');
const { getStudentAttendanceStats } = require('../services/attendanceService');

// @desc    Get all students with search, filters, pagination, sort
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      sport,
      batch,
      feeStatus,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      exportAll
    } = req.query;

    const query = {};

    // For coaches, restrict to students in their assigned batches
    if (req.user.role === 'coach') {
      const assignedBatches = await Batch.find({ coach: req.user.coachProfile || req.user._id }).select('_id');
      query.batch = { $in: assignedBatches.map(b => b._id) };
    }

    if (status) {
      query.status = status;
    }

    if (sport && sport !== 'all') {
      query.sport = sport;
    }

    if (batch && batch !== 'all') {
      query.batch = batch;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { parentPhone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Export query if requested
    if (exportAll === 'true') {
      const allStudents = await Student.find(query)
        .populate('batch', 'name startTime endTime')
        .populate('coach', 'name')
        .sort(sortOptions);
      return res.json({ success: true, count: allStudents.length, data: allStudents });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('batch', 'name startTime endTime maxCapacity')
      .populate('coach', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Compute fee status on the fly for each student
    const studentIds = students.map(s => s._id);
    const invoices = await FeeInvoice.find({ student: { $in: studentIds } });
    
    const enriched = students.map(s => {
      const sInvoices = invoices.filter(inv => inv.student.toString() === s._id.toString());
      const hasOverdue = sInvoices.some(inv => inv.status === 'overdue');
      const hasUnpaid = sInvoices.some(inv => inv.status === 'unpaid' || inv.status === 'partial');
      const feeState = hasOverdue ? 'overdue' : (hasUnpaid ? 'pending' : 'paid');

      return {
        ...s.toObject(),
        feeStatus: feeState
      };
    });

    // If filtered by feeStatus
    const filteredData = feeStatus && feeStatus !== 'all' 
      ? enriched.filter(s => s.feeStatus === feeStatus)
      : enriched;

    res.json({
      success: true,
      count: filteredData.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: filteredData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with profile, attendance stats, and fee history
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('batch')
      .populate('coach', 'name email phone specialization');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Balance & Fee history
    const balanceInfo = await calculateStudentBalance(student._id);
    const invoices = await FeeInvoice.find({ student: student._id }).sort({ year: -1, month: -1 });
    const payments = await Payment.find({ student: student._id }).sort({ paymentDate: -1 });

    // Attendance stats
    const attendanceStats = await getStudentAttendanceStats(student._id);

    res.json({
      success: true,
      data: {
        student,
        financials: {
          ...balanceInfo,
          invoices,
          payments
        },
        attendance: attendanceStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admins)
const createStudent = async (req, res, next) => {
  try {
    const {
      fullName,
      dob,
      gender,
      phone,
      email,
      address,
      parentName,
      parentPhone,
      emergencyContact,
      sport,
      batch: batchId,
      monthlyFee,
      previousOutstandingDues = 0,
      medicalNotes,
      avatar
    } = req.body;

    // Validate batch & check capacity
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Assigned batch does not exist' });
    }

    const currentCount = await Student.countDocuments({ batch: batchId, status: 'active' });
    if (currentCount >= batch.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Batch "${batch.name}" is already at full capacity (${batch.maxCapacity} students). Cannot enroll more students.`
      });
    }

    // Auto-generate student ID e.g. "ATX-2026-0042"
    const count = await Student.countDocuments();
    const studentId = `ATX-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const student = await Student.create({
      studentId,
      fullName,
      dob,
      gender,
      phone,
      email,
      address,
      parentName,
      parentPhone,
      emergencyContact,
      sport: sport || batch.sport,
      batch: batchId,
      coach: batch.coach,
      monthlyFee: monthlyFee !== undefined ? monthlyFee : batch.monthlyFee,
      previousOutstandingDues,
      medicalNotes,
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${studentId}`,
      status: 'active'
    });

    // Create initial invoice for the current month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const dueDate = new Date(currentYear, currentMonth - 1, 10);
    const totalPayable = Number(student.monthlyFee) + Number(previousOutstandingDues);

    await FeeInvoice.create({
      invoiceNumber: `INV-${currentYear}${String(currentMonth).padStart(2, '0')}-${student.studentId}`,
      student: student._id,
      month: currentMonth,
      year: currentYear,
      dueDate,
      baseFee: student.monthlyFee,
      previousDues: previousOutstandingDues,
      totalPayable,
      paidAmount: 0,
      balance: totalPayable,
      status: totalPayable === 0 ? 'paid' : 'unpaid'
    });

    // Audit log
    await AuditLog.create({
      entity: 'Student',
      entityId: student._id.toString(),
      action: 'CREATE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: { studentId: student.studentId, fullName: student.fullName, batch: batch.name }
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admins)
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // If changing batch, check capacity of target batch
    if (req.body.batch && req.body.batch !== student.batch.toString()) {
      const targetBatch = await Batch.findById(req.body.batch);
      if (!targetBatch) {
        return res.status(404).json({ success: false, message: 'Target batch does not exist' });
      }
      const count = await Student.countDocuments({ batch: req.body.batch, status: 'active' });
      if (count >= targetBatch.maxCapacity) {
        return res.status(400).json({
          success: false,
          message: `Target batch "${targetBatch.name}" is already at maximum capacity (${targetBatch.maxCapacity})`
        });
      }
      req.body.coach = targetBatch.coach;
      req.body.sport = targetBatch.sport;
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('batch').populate('coach');

    await AuditLog.create({
      entity: 'Student',
      entityId: updated._id.toString(),
      action: 'UPDATE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: { updatedFields: Object.keys(req.body) }
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student (soft delete or check financial history)
// @route   DELETE /api/students/:id
// @access  Private (Super Admin / Academy Admin)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Preserve historical integrity: soft delete by marking inactive and keeping all payment/invoice records
    student.status = 'inactive';
    await student.save();

    await AuditLog.create({
      entity: 'Student',
      entityId: student._id.toString(),
      action: 'DELETE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: { studentId: student.studentId, fullName: student.fullName, reason: 'Deactivated from system' }
    });

    res.json({
      success: true,
      message: `Student "${student.fullName}" deactivated successfully. Payment and attendance records preserved.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
