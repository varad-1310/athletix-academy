const Student = require('../models/Student');
const Coach = require('../models/Coach');
const Batch = require('../models/Batch');
const Payment = require('../models/Payment');
const FeeInvoice = require('../models/FeeInvoice');
const Attendance = require('../models/Attendance');

// @desc    Generate comprehensive reports and analytics
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res, next) => {
  try {
    const { reportType, sport, batchId, startDate, endDate, year } = req.query;

    const currentYear = Number(year) || new Date().getFullYear();

    // 1. Registrations report
    const studentQuery = {};
    if (sport && sport !== 'all') studentQuery.sport = sport;
    if (batchId && batchId !== 'all') studentQuery.batch = batchId;

    const registrations = await Student.find(studentQuery)
      .populate('batch', 'name')
      .populate('coach', 'name')
      .sort({ joiningDate: -1 });

    // 2. Revenue report
    const paymentQuery = { status: 'success' };
    if (startDate && endDate) {
      paymentQuery.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const payments = await Payment.find(paymentQuery)
      .populate('student', 'studentId fullName sport')
      .sort({ paymentDate: -1 });

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    // 3. Sport stats
    const sportStats = await Student.aggregate([
      { $group: { _id: '$sport', total: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } } } }
    ]);

    // 4. Coach load
    const coaches = await Coach.find({ status: 'active' });
    const coachStats = await Promise.all(coaches.map(async (c) => {
      const studentCount = await Student.countDocuments({ coach: c._id, status: 'active' });
      const batchCount = await Batch.countDocuments({ coach: c._id, status: 'active' });
      return {
        coachName: c.name,
        specialization: c.specialization,
        assignedSports: c.assignedSports,
        studentCount,
        batchCount
      };
    }));

    // 5. Pending & Overdue summary
    const pendingInvoices = await FeeInvoice.find({
      status: { $in: ['unpaid', 'partial', 'overdue'] }
    }).populate('student', 'studentId fullName parentName parentPhone sport');

    res.json({
      success: true,
      reportData: {
        totalStudentsCount: registrations.length,
        totalRevenue: totalCollected,
        registrations,
        payments,
        sportStats,
        coachStats,
        pendingInvoices
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports
};
