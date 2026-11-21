require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Coach = require('../models/Coach');
const Attendance = require('../models/Attendance');
const FeeInvoice = require('../models/FeeInvoice');
const Payment = require('../models/Payment');
const { calculateStudentBalance } = require('../services/feeService');
const { getStudentAttendanceStats } = require('../services/attendanceService');
const { seedDatabase } = require('../seed/seedData');

async function runTests() {
  console.log('=== STARTING ATHLETIX ACADEMY AUTOMATED TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    await connectDB();

    console.log('\n--- 1. Testing Database & Seed Execution ---');
    const seedResult = await seedDatabase();
    assert(seedResult.students >= 120, `Seeded at least 120 students (actual: ${seedResult.students})`);
    assert(seedResult.coaches >= 8, `Seeded at least 8 coaches (actual: ${seedResult.coaches})`);
    assert(seedResult.batches >= 10, `Seeded at least 10 batches (actual: ${seedResult.batches})`);

    console.log('\n--- 2. Testing Authentication & User Accounts ---');
    const superAdmin = await User.findOne({ email: 'superadmin@athletix.com' }).select('+password');
    assert(superAdmin !== null, 'Super Admin user exists');
    assert(superAdmin.role === 'super_admin', 'Super Admin has correct role');
    const isPassValid = await superAdmin.matchPassword('Password@123');
    assert(isPassValid, 'Super Admin password hashing & verification works');

    const coachUser = await User.findOne({ email: 'coach.rohit@athletix.com' }).select('+password');
    assert(coachUser !== null, 'Coach user exists');
    assert(coachUser.role === 'coach', 'Coach user has role "coach"');

    console.log('\n--- 3. Testing Batch Capacity Enforcement ---');
    const testCoach = await Coach.findOne({ status: 'active' });
    const tightBatch = await Batch.create({
      name: 'Test Capacity Batch',
      sport: 'Cricket',
      coach: testCoach._id,
      trainingDays: ['Monday'],
      startTime: '06:00 AM',
      endTime: '07:00 AM',
      maxCapacity: 2,
      monthlyFee: 2000,
      status: 'active'
    });

    const s1 = await Student.create({
      studentId: 'TEST-001',
      fullName: 'Test Student 1',
      dob: new Date(2010, 1, 1),
      gender: 'Male',
      parentName: 'Parent 1',
      parentPhone: '9999999901',
      sport: 'Cricket',
      batch: tightBatch._id,
      monthlyFee: 2000,
      status: 'active'
    });

    const s2 = await Student.create({
      studentId: 'TEST-002',
      fullName: 'Test Student 2',
      dob: new Date(2010, 1, 1),
      gender: 'Male',
      parentName: 'Parent 2',
      parentPhone: '9999999902',
      sport: 'Cricket',
      batch: tightBatch._id,
      monthlyFee: 2000,
      status: 'active'
    });

    const enrolledCount = await Student.countDocuments({ batch: tightBatch._id, status: 'active' });
    assert(enrolledCount === 2, 'Batch has reached max capacity of 2');
    const isFull = enrolledCount >= tightBatch.maxCapacity;
    assert(isFull === true, 'Capacity check accurately detects full batch');

    console.log('\n--- 4. Testing Attendance Recording & Duplicate Prevention ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attDoc = await Attendance.create({
      date: today,
      sport: 'Cricket',
      batch: tightBatch._id,
      records: [
        { student: s1._id, status: 'present' },
        { student: s2._id, status: 'absent', remark: 'Sick leave' }
      ]
    });
    assert(attDoc !== null, 'Attendance record created');

    // Duplicate check
    let duplicateCaught = false;
    try {
      await Attendance.create({
        date: today,
        sport: 'Cricket',
        batch: tightBatch._id,
        records: [{ student: s1._id, status: 'present' }]
      });
    } catch (e) {
      duplicateCaught = true;
    }
    assert(duplicateCaught === true, 'Duplicate attendance on same batch and date is prevented');

    const s1Stats = await getStudentAttendanceStats(s1._id);
    assert(s1Stats.totalSessions >= 1, 'Student attendance stats calculated sessions');
    assert(s1Stats.presentCount >= 1, 'Student marked present counted');

    console.log('\n--- 5. Testing Fee Calculation & Financial Accuracy ---');
    // Balance calculation: Remaining balance = Previous balance + Amount due - Payments allocated
    const balanceBefore = await calculateStudentBalance(s1._id);
    assert(balanceBefore.currentOutstanding === 0, 'New student with no dues starts at 0 balance');

    // Create an invoice of ₹2000
    const inv = await FeeInvoice.create({
      invoiceNumber: 'INV-TEST-001',
      student: s1._id,
      month: 11,
      year: 2026,
      dueDate: new Date(2026, 10, 10),
      baseFee: 2000,
      previousDues: 0,
      totalPayable: 2000,
      paidAmount: 0,
      balance: 2000,
      status: 'unpaid'
    });

    const balanceAfterInv = await calculateStudentBalance(s1._id);
    assert(balanceAfterInv.currentOutstanding === 2000, 'Balance accurately reflects 2000 after invoice creation');

    // Record partial payment of ₹1200
    const payment = await Payment.create({
      receiptNumber: 'RCP-TEST-001',
      invoice: inv._id,
      student: s1._id,
      amount: 1200,
      paymentMethod: 'upi',
      feeMonth: 11,
      feeYear: 2026,
      previousBalance: 2000,
      remainingBalance: 800,
      status: 'success'
    });

    inv.paidAmount += 1200;
    inv.balance = inv.totalPayable - inv.paidAmount;
    inv.status = 'partial';
    await inv.save();

    const balanceAfterPay = await calculateStudentBalance(s1._id);
    assert(balanceAfterPay.currentOutstanding === 800, 'Remaining balance accurately calculated as 800 (2000 - 1200)');

    console.log('\n--- 6. Testing Payment Reversal & Financial Integrity ---');
    // Reversing the payment
    payment.status = 'reversed';
    payment.reversalReason = 'Erroneous UPI transfer reversal';
    await payment.save();

    inv.paidAmount -= 1200;
    inv.balance = inv.totalPayable;
    inv.status = 'unpaid';
    await inv.save();

    const balanceAfterReversal = await calculateStudentBalance(s1._id);
    assert(balanceAfterReversal.currentOutstanding === 2000, 'Reversal restored exact 2000 outstanding balance without data corruption');

    // Clean up test batch and test students
    await Student.deleteMany({ _id: { $in: [s1._id, s2._id] } });
    await Batch.deleteOne({ _id: tightBatch._id });
    await Attendance.deleteOne({ _id: attDoc._id });
    await FeeInvoice.deleteOne({ _id: inv._id });
    await Payment.deleteOne({ _id: payment._id });

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    await disconnectDB();
    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
}

runTests();
