const Payment = require('../models/Payment');
const FeeInvoice = require('../models/FeeInvoice');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');
const { calculateStudentBalance } = require('../services/feeService');

// @desc    Get all payments / invoices
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res, next) => {
  try {
    const {
      search,
      status,
      method,
      month,
      year,
      sortBy = 'paymentDate',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status && status !== 'all') query.status = status;
    if (method && method !== 'all') query.paymentMethod = method;
    if (month && month !== 'all') query.feeMonth = Number(month);
    if (year && year !== 'all') query.feeYear = Number(year);

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    let studentIds = null;
    if (search) {
      const matchedStudents = await Student.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      studentIds = matchedStudents.map(s => s._id);

      query.$or = [
        { receiptNumber: { $regex: search, $options: 'i' } },
        { student: { $in: studentIds } }
      ];
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('student', 'studentId fullName parentName parentPhone sport')
      .populate('recordedBy', 'name role')
      .populate('reversedBy', 'name role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all fee invoices
// @route   GET /api/payments/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const { status, month, year, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (month && month !== 'all') query.month = Number(month);
    if (year && year !== 'all') query.year = Number(year);

    if (search) {
      const matchedStudents = await Student.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { student: { $in: matchedStudents.map(s => s._id) } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await FeeInvoice.countDocuments(query);
    const invoices = await FeeInvoice.find(query)
      .populate('student', 'studentId fullName parentName parentPhone sport monthlyFee')
      .sort({ year: -1, month: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a new payment with accurate balance calculation
// @route   POST /api/payments
// @access  Private (Admins)
const recordPayment = async (req, res, next) => {
  try {
    const {
      studentId,
      amount,
      paymentMethod,
      feeMonth,
      feeYear,
      notes,
      transactionReference
    } = req.body;

    if (!studentId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, amount, and paymentMethod'
      });
    }

    const payAmount = Number(amount);
    if (payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const currentMonth = Number(feeMonth) || (new Date().getMonth() + 1);
    const currentYear = Number(feeYear) || new Date().getFullYear();

    // Calculate current financial state before recording payment
    // Remaining balance = Previous balance + Amount due - Payments allocated
    const balanceInfo = await calculateStudentBalance(student._id);
    const previousBalance = balanceInfo.currentOutstanding;
    const remainingBalance = Math.max(0, previousBalance - payAmount);

    // Auto-generate unique receipt number e.g. "RCP-202611-0089"
    const paymentCount = await Payment.countDocuments();
    const receiptNumber = `RCP-${currentYear}${String(currentMonth).padStart(2, '0')}-${String(paymentCount + 1).padStart(4, '0')}`;

    // Find or create matching invoice for this month
    let invoice = await FeeInvoice.findOne({ student: student._id, month: currentMonth, year: currentYear });
    if (!invoice) {
      const dueDate = new Date(currentYear, currentMonth - 1, 10);
      const totalPayable = (student.monthlyFee || 0) + previousBalance;
      invoice = await FeeInvoice.create({
        invoiceNumber: `INV-${currentYear}${String(currentMonth).padStart(2, '0')}-${student.studentId}`,
        student: student._id,
        month: currentMonth,
        year: currentYear,
        dueDate,
        baseFee: student.monthlyFee || 0,
        previousDues: previousBalance,
        totalPayable,
        paidAmount: 0,
        balance: totalPayable,
        status: 'unpaid'
      });
    }

    // Allocate payment to invoice
    invoice.paidAmount += payAmount;
    invoice.balance = Math.max(0, invoice.totalPayable - invoice.paidAmount);
    invoice.status = invoice.balance === 0 ? 'paid' : (invoice.paidAmount > 0 ? 'partial' : 'unpaid');
    await invoice.save();

    // Create Payment Record
    const payment = await Payment.create({
      receiptNumber,
      invoice: invoice._id,
      student: student._id,
      amount: payAmount,
      paymentMethod,
      paymentDate: new Date(),
      feeMonth: currentMonth,
      feeYear: currentYear,
      previousBalance,
      remainingBalance,
      transactionReference: transactionReference || '',
      notes: notes || '',
      recordedBy: req.user._id,
      status: 'success'
    });

    // Audit Log
    await AuditLog.create({
      entity: 'Payment',
      entityId: payment._id.toString(),
      action: 'CREATE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: {
        receiptNumber,
        studentName: student.fullName,
        amount: payAmount,
        method: paymentMethod,
        remainingBalance
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment,
        receipt: {
          receiptNumber: payment.receiptNumber,
          studentName: student.fullName,
          studentId: student.studentId,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          sport: student.sport,
          amountPaid: payAmount,
          paymentMethod,
          feeMonth: currentMonth,
          feeYear: currentYear,
          paymentDate: payment.paymentDate,
          previousBalance,
          remainingBalance,
          recordedBy: req.user.name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reverse payment with authorization and audit log
// @route   POST /api/payments/:id/reverse
// @access  Private (Super Admin / Academy Admin)
const reversePayment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a valid reason for reversal' });
    }

    const payment = await Payment.findById(req.params.id).populate('student');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status === 'reversed') {
      return res.status(400).json({ success: false, message: 'This payment has already been reversed' });
    }

    // Mark payment reversed
    payment.status = 'reversed';
    payment.reversedAt = new Date();
    payment.reversedBy = req.user._id;
    payment.reversalReason = reason;
    await payment.save();

    // Revert invoice allocation if invoice exists
    if (payment.invoice) {
      const invoice = await FeeInvoice.findById(payment.invoice);
      if (invoice) {
        invoice.paidAmount = Math.max(0, invoice.paidAmount - payment.amount);
        invoice.balance = Math.min(invoice.totalPayable, invoice.balance + payment.amount);
        invoice.status = invoice.paidAmount === 0 ? 'unpaid' : 'partial';
        await invoice.save();
      }
    }

    // Audit log
    await AuditLog.create({
      entity: 'Payment',
      entityId: payment._id.toString(),
      action: 'REVERSE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      details: {
        receiptNumber: payment.receiptNumber,
        studentName: payment.student?.fullName,
        amount: payment.amount,
        reversalReason: reason
      }
    });

    res.json({
      success: true,
      message: `Payment ${payment.receiptNumber} successfully reversed. Outstanding balance restored.`,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getInvoices,
  recordPayment,
  reversePayment
};
