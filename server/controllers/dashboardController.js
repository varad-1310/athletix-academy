const Student = require('../models/Student');
const Coach = require('../models/Coach');
const Batch = require('../models/Batch');
const Attendance = require('../models/Attendance');
const FeeInvoice = require('../models/FeeInvoice');
const Payment = require('../models/Payment');

// @desc    Get complete real-time dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Student counts
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const inactiveStudents = totalStudents - activeStudents;

    // 2. Coach and Batch counts
    const totalCoaches = await Coach.countDocuments({ status: 'active' });
    const totalBatches = await Batch.countDocuments({ status: 'active' });

    // 3. Financial calculations from real database records
    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          feeMonth: currentMonth,
          feeYear: currentYear,
          status: 'success'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    const monthlyRevenue = monthlyPayments[0]?.totalRevenue || 0;

    // Pending & Overdue fees from invoices
    const invoiceStats = await FeeInvoice.aggregate([
      {
        $match: {
          year: currentYear
        }
      },
      {
        $group: {
          _id: '$status',
          totalBalance: { $sum: '$balance' },
          count: { $sum: 1 }
        }
      }
    ]);

    let pendingFees = 0;
    let overdueFees = 0;
    invoiceStats.forEach(stat => {
      if (stat._id === 'unpaid' || stat._id === 'partial') {
        pendingFees += stat.totalBalance;
      } else if (stat._id === 'overdue') {
        overdueFees += stat.totalBalance;
      }
    });

    // 4. Today's attendance stats
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayAttendances = await Attendance.find({
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    let todayPresent = 0;
    let todayTotal = 0;

    todayAttendances.forEach(att => {
      att.records.forEach(r => {
        todayTotal++;
        if (r.status === 'present' || r.status === 'late') {
          todayPresent++;
        }
      });
    });

    const attendancePercentage = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

    // 5. Monthly fee collection trend (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const rev = await Payment.aggregate([
        { $match: { feeMonth: m, feeYear: y, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const inv = await FeeInvoice.aggregate([
        { $match: { month: m, year: y } },
        { $group: { _id: null, total: { $sum: '$totalPayable' } } }
      ]);

      monthlyTrends.push({
        month: monthNames[m - 1],
        collected: rev[0]?.total || 0,
        expected: inv[0]?.total || 0
      });
    }

    // 6. Sport-wise student distribution
    const sportDistribution = await Student.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).then(res => res.map(r => ({ sport: r._id, students: r.count })));

    // 7. Batch-wise student distribution & capacity
    const batches = await Batch.find({ status: 'active' }).select('name maxCapacity');
    const batchDistribution = await Promise.all(batches.map(async (b) => {
      const enrolled = await Student.countDocuments({ batch: b._id, status: 'active' });
      return {
        batch: b.name,
        enrolled,
        capacity: b.maxCapacity
      };
    }));

    // 8. Attendance trends (last 7 recorded days)
    const recentAttendances = await Attendance.find().sort({ date: -1 }).limit(14);
    const dateMap = {};
    recentAttendances.forEach(att => {
      const dateKey = new Date(att.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, present: 0, absent: 0, total: 0 };
      }
      att.records.forEach(r => {
        dateMap[dateKey].total++;
        if (r.status === 'present') dateMap[dateKey].present++;
        else if (r.status === 'absent') dateMap[dateKey].absent++;
      });
    });

    const attendanceTrends = Object.values(dateMap).slice(0, 7).reverse();

    res.json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        totalCoaches,
        totalBatches,
        monthlyRevenue,
        pendingFees,
        overdueFees,
        todayAttendance: todayPresent,
        todayTotal,
        attendancePercentage
      },
      charts: {
        monthlyCollection: monthlyTrends,
        sportDistribution,
        batchDistribution,
        attendanceTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
