const FeeInvoice = require('../models/FeeInvoice');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');

/**
 * Calculates remaining balance correctly:
 * Remaining balance = Previous balance + Amount due - Payments allocated.
 * Does NOT simply subtract all historical payments from current month fee.
 */
const calculateStudentBalance = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) throw new Error('Student not found');

  // Sum all invoices totalPayable
  const invoices = await FeeInvoice.find({ student: studentId });
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.baseFee || 0), 0) + (student.previousOutstandingDues || 0);

  // Sum all non-reversed payments
  const payments = await Payment.find({ student: studentId, status: 'success' });
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const currentOutstanding = Math.max(0, totalInvoiced - totalPaid);

  return {
    studentId: student._id,
    studentName: student.fullName,
    previousOutstandingDues: student.previousOutstandingDues || 0,
    monthlyFee: student.monthlyFee || 0,
    totalInvoiced,
    totalPaid,
    currentOutstanding
  };
};

/**
 * Generate invoices for all active students for a given month/year if not already generated
 */
const generateMonthlyInvoices = async (month, year) => {
  const activeStudents = await Student.find({ status: 'active' });
  const results = { created: 0, skipped: 0 };

  const dueDate = new Date(year, month - 1, 10); // 10th of the month

  for (const student of activeStudents) {
    const existing = await FeeInvoice.findOne({ student: student._id, month, year });
    if (existing) {
      results.skipped++;
      continue;
    }

    // Get previous balance before this invoice
    const balanceInfo = await calculateStudentBalance(student._id);
    const invoiceNumber = `INV-${year}${String(month).padStart(2, '0')}-${student.studentId}`;
    const totalPayable = (student.monthlyFee || 0) + balanceInfo.currentOutstanding;

    await FeeInvoice.create({
      invoiceNumber,
      student: student._id,
      month,
      year,
      dueDate,
      baseFee: student.monthlyFee || 0,
      previousDues: balanceInfo.currentOutstanding,
      totalPayable,
      paidAmount: 0,
      balance: totalPayable,
      status: totalPayable === 0 ? 'paid' : (new Date() > dueDate ? 'overdue' : 'unpaid')
    });
    results.created++;
  }

  return results;
};

module.exports = {
  calculateStudentBalance,
  generateMonthlyInvoices
};
