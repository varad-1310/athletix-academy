const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Sport = require('../models/Sport');
const Coach = require('../models/Coach');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const FeeInvoice = require('../models/FeeInvoice');
const Payment = require('../models/Payment');
const AcademySettings = require('../models/AcademySettings');
const FeePlan = require('../models/FeePlan');
const AuditLog = require('../models/AuditLog');

const SPORTS_DATA = [
  { name: 'Cricket', code: 'CRK', icon: 'Shield', defaultMonthlyFee: 3000, description: 'Batting, bowling, fielding and match simulation' },
  { name: 'Football', code: 'FTB', icon: 'Activity', defaultMonthlyFee: 2500, description: 'Technical ball mastery, tactical drills and stamina' },
  { name: 'Badminton', code: 'BDM', icon: 'Zap', defaultMonthlyFee: 2200, description: 'Footwork, smashes, endurance and agility court training' },
  { name: 'Basketball', code: 'BB', icon: 'Target', defaultMonthlyFee: 2400, description: 'Shooting, dribbling, defensive drills and team plays' },
  { name: 'Swimming', code: 'SWM', icon: 'Compass', defaultMonthlyFee: 2800, description: 'Freestyle, breaststroke, butterfly and Olympic form' },
  { name: 'Tennis', code: 'TNS', icon: 'Award', defaultMonthlyFee: 3200, description: 'Forehand, backhand, serves, volleys and match strategy' },
  { name: 'Volleyball', code: 'VLB', icon: 'TrendingUp', defaultMonthlyFee: 2000, description: 'Spiking, setting, blocking and court teamwork' },
  { name: 'Athletics', code: 'ATH', icon: 'Flame', defaultMonthlyFee: 1800, description: 'Sprint mechanics, hurdles, long jump and track conditioning' }
];

const COACHES_DATA = [
  { name: 'Rohit Sharma', email: 'coach.rohit@athletix.com', phone: '+91 98234 11001', specialization: 'Elite Batting & Captaincy', experience: '12 Years', assignedSports: ['Cricket'], salary: 65000 },
  { name: 'Marcus D’Souza', email: 'coach.marcus@athletix.com', phone: '+91 98234 11002', specialization: 'Pro Football Tactical Coaching', experience: '9 Years', assignedSports: ['Football'], salary: 55000 },
  { name: 'P. V. Sindhuja', email: 'coach.sindhuja@athletix.com', phone: '+91 98234 11003', specialization: 'National Badminton Footwork & Net Play', experience: '8 Years', assignedSports: ['Badminton'], salary: 50000 },
  { name: 'David Miller', email: 'coach.david@athletix.com', phone: '+91 98234 11004', specialization: 'Shooting & High-Performance Drills', experience: '10 Years', assignedSports: ['Basketball'], salary: 52000 },
  { name: 'Vikram Khade', email: 'coach.vikram@athletix.com', phone: '+91 98234 11005', specialization: 'Olympic Swimming & Endurance', experience: '14 Years', assignedSports: ['Swimming'], salary: 60000 },
  { name: 'Sania Mirza-Roy', email: 'coach.sania@athletix.com', phone: '+91 98234 11006', specialization: 'Grand Slam Conditioning & Power Serve', experience: '11 Years', assignedSports: ['Tennis'], salary: 62000 },
  { name: 'Arjun Nambiar', email: 'coach.arjun@athletix.com', phone: '+91 98234 11007', specialization: 'Volleyball Tactical Defense & Serving', experience: '7 Years', assignedSports: ['Volleyball'], salary: 45000 },
  { name: 'Neeraj Rawat', email: 'coach.neeraj@athletix.com', phone: '+91 98234 11008', specialization: 'Sprint Mechanics & Track Conditioning', experience: '9 Years', assignedSports: ['Athletics'], salary: 48000 }
];

const BATCHES_DEF = [
  { name: 'Cricket Colts Morning', sport: 'Cricket', coachIndex: 0, days: ['Monday', 'Wednesday', 'Friday'], start: '06:30 AM', end: '08:30 AM', capacity: 20, fee: 3000 },
  { name: 'Cricket Challengers Evening', sport: 'Cricket', coachIndex: 0, days: ['Tuesday', 'Thursday', 'Saturday'], start: '04:30 PM', end: '06:30 PM', capacity: 20, fee: 3000 },
  { name: 'Football Thunder Squad', sport: 'Football', coachIndex: 1, days: ['Monday', 'Wednesday', 'Friday'], start: '07:00 AM', end: '08:30 AM', capacity: 22, fee: 2500 },
  { name: 'Football Strikers Evening', sport: 'Football', coachIndex: 1, days: ['Tuesday', 'Thursday', 'Saturday'], start: '05:00 PM', end: '06:30 PM', capacity: 20, fee: 2500 },
  { name: 'Badminton Aces Batch', sport: 'Badminton', coachIndex: 2, days: ['Monday', 'Wednesday', 'Friday'], start: '06:00 AM', end: '07:30 AM', capacity: 16, fee: 2200 },
  { name: 'Badminton Smashers Evening', sport: 'Badminton', coachIndex: 2, days: ['Tuesday', 'Thursday', 'Saturday'], start: '05:30 PM', end: '07:00 PM', capacity: 16, fee: 2200 },
  { name: 'Basketball Dunkers', sport: 'Basketball', coachIndex: 3, days: ['Monday', 'Wednesday', 'Friday'], start: '04:00 PM', end: '05:30 PM', capacity: 18, fee: 2400 },
  { name: 'Swimming Aqua Sharks', sport: 'Swimming', coachIndex: 4, days: ['Tuesday', 'Thursday', 'Saturday'], start: '06:30 AM', end: '08:00 AM', capacity: 15, fee: 2800 },
  { name: 'Tennis Grand Slam Starters', sport: 'Tennis', coachIndex: 5, days: ['Monday', 'Wednesday', 'Friday'], start: '07:30 AM', end: '09:00 AM', capacity: 12, fee: 3200 },
  { name: 'Track & Field Speedsters', sport: 'Athletics', coachIndex: 7, days: ['Monday', 'Wednesday', 'Saturday'], start: '06:00 AM', end: '07:30 AM', capacity: 20, fee: 1800 }
];

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Ananya', 'Diya', 'Isha', 'Aadhya', 'Saanvi', 'Myra', 'Navya', 'Pari', 'Anika', 'Rohan', 'Kabir', 'Aryan', 'Kunal', 'Dev', 'Tara', 'Riya', 'Siya', 'Tanvi', 'Sara'];
const LAST_NAMES = ['Patel', 'Sharma', 'Verma', 'Gupta', 'Singh', 'Reddy', 'Mehta', 'Chopra', 'Nair', 'Iyer', 'Joshi', 'Kulkarni', 'Deshmukh', 'Bhatia', 'Malhotra', 'Kapoor', 'Saxena', 'Mukherjee', 'Chatterjee', 'Rao'];

const seedDatabase = async () => {
  console.log('[Seed] Starting database seeding...');

  // 1. Academy Settings
  let settings = await AcademySettings.findOne();
  if (!settings) {
    settings = await AcademySettings.create({
      academyName: 'ATHLETIX ACADEMY',
      tagline: 'Train Smarter. Manage Better. Perform Stronger.',
      logo: '',
      email: 'contact@athletixacademy.com',
      phone: '+91 98765 43210',
      address: 'Plot 42, Olympic Avenue, Sports City, India',
      website: 'https://athletixacademy.com',
      academicYear: '2026-2027',
      currency: '₹',
      supportedSports: SPORTS_DATA.map(s => s.name)
    });
  }

  // 2. Sports
  const sportsMap = {};
  for (const s of SPORTS_DATA) {
    let sport = await Sport.findOne({ name: s.name });
    if (!sport) {
      sport = await Sport.create(s);
    }
    sportsMap[s.name] = sport;
  }

  // 3. Admin Users
  let superAdmin = await User.findOne({ email: 'superadmin@athletix.com' });
  if (!superAdmin) {
    superAdmin = await User.create({
      name: 'Vikramaditya Singhania',
      email: 'superadmin@athletix.com',
      password: 'Password@123',
      role: 'super_admin',
      phone: '+91 90000 00001',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=SuperAdmin',
      isDemoAccount: true
    });
  }

  let academyAdmin = await User.findOne({ email: 'admin@athletix.com' });
  if (!academyAdmin) {
    academyAdmin = await User.create({
      name: 'Pooja Kashyap',
      email: 'admin@athletix.com',
      password: 'Password@123',
      role: 'academy_admin',
      phone: '+91 90000 00002',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=AcademyAdmin',
      isDemoAccount: true
    });
  }

  // 4. Coaches
  const coaches = [];
  for (let i = 0; i < COACHES_DATA.length; i++) {
    const cData = COACHES_DATA[i];
    let coach = await Coach.findOne({ email: cData.email });
    if (!coach) {
      const coachId = `COACH-${String(i + 1).padStart(3, '0')}`;
      coach = await Coach.create({
        coachId,
        name: cData.name,
        email: cData.email,
        phone: cData.phone,
        specialization: cData.specialization,
        experience: cData.experience,
        assignedSports: cData.assignedSports,
        salary: cData.salary,
        avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${coachId}`,
        status: 'active'
      });
    }
    coaches.push(coach);

    // Create user login account for first coach
    if (i === 0) {
      let coachUser = await User.findOne({ email: cData.email });
      if (!coachUser) {
        coachUser = await User.create({
          name: cData.name,
          email: cData.email,
          password: 'Password@123',
          role: 'coach',
          phone: cData.phone,
          avatar: coach.avatar,
          coachProfile: coach._id,
          isDemoAccount: true
        });
      }
    }
  }

  // 5. Batches (10 Batches)
  const batches = [];
  for (let i = 0; i < BATCHES_DEF.length; i++) {
    const bDef = BATCHES_DEF[i];
    const coach = coaches[bDef.coachIndex] || coaches[0];
    let batch = await Batch.findOne({ name: bDef.name });
    if (!batch) {
      batch = await Batch.create({
        name: bDef.name,
        sport: bDef.sport,
        coach: coach._id,
        trainingDays: bDef.days,
        startTime: bDef.start,
        endTime: bDef.end,
        maxCapacity: bDef.capacity,
        monthlyFee: bDef.fee,
        status: 'active'
      });
    }
    batches.push(batch);
  }

  // 6. Generate 120 Realistic Students distributed across 10 batches
  const existingCount = await Student.countDocuments({ isDemoRecord: true });
  const students = [];

  if (existingCount < 120) {
    // Clear demo students to maintain clean 120 set if partial
    if (existingCount > 0) {
      await Student.deleteMany({ isDemoRecord: true });
      await FeeInvoice.deleteMany({ isDemoRecord: true });
      await Payment.deleteMany({ isDemoRecord: true });
      await Attendance.deleteMany({});
    }

    console.log('[Seed] Generating 120 realistic students...');
    for (let i = 1; i <= 120; i++) {
      const fName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lName = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
      const fullName = `${fName} ${lName}`;
      const batch = batches[(i - 1) % batches.length];
      const studentId = `ATX-2026-${String(i).padStart(4, '0')}`;
      const gender = i % 2 === 0 ? 'Male' : 'Female';
      const age = 8 + (i % 12); // age between 8 and 19
      const dob = new Date(2026 - age, (i % 12), (i % 28) + 1);

      // Pre-set some previous balance for variance
      const prevDues = i % 5 === 0 ? (i % 3 === 0 ? 3000 : 1500) : 0;

      const student = await Student.create({
        studentId,
        fullName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${studentId}`,
        dob,
        gender,
        phone: `+91 98${String(10000000 + i).substring(1, 9)}`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@athletixdemo.in`,
        address: `${(i * 12) % 300 + 1}, Residency Road, Sector ${(i % 15) + 1}, Sports City`,
        parentName: `Mr. Rajesh ${lName}`,
        parentPhone: `+91 97${String(20000000 + i).substring(1, 9)}`,
        emergencyContact: `+91 99${String(30000000 + i).substring(1, 9)}`,
        sport: batch.sport,
        batch: batch._id,
        coach: batch.coach,
        joiningDate: new Date(2026, 7, (i % 25) + 1), // Aug 2026
        monthlyFee: batch.monthlyFee,
        previousOutstandingDues: prevDues,
        medicalNotes: i % 15 === 0 ? 'Mild asthma; uses inhaler before warmups.' : 'Fit and cleared for high intensity training.',
        status: i > 115 ? 'inactive' : 'active',
        isDemoRecord: true
      });
      students.push(student);
    }
  } else {
    const found = await Student.find({ isDemoRecord: true });
    students.push(...found);
  }

  // 7. Generate 3 Months Invoices and Payments (Sep 2026, Oct 2026, Nov 2026)
  const existingInvoices = await FeeInvoice.countDocuments({ isDemoRecord: true });
  if (existingInvoices === 0) {
    console.log('[Seed] Generating 3 months of fee invoices and payments with diverse statuses...');
    const months = [
      { month: 9, year: 2026 },
      { month: 10, year: 2026 },
      { month: 11, year: 2026 }
    ];

    let rcpCounter = 100;

    for (const mInfo of months) {
      for (let sIdx = 0; sIdx < students.length; sIdx++) {
        const student = students[sIdx];
        const invoiceNum = `INV-${mInfo.year}${String(mInfo.month).padStart(2, '0')}-${student.studentId}`;
        const dueDate = new Date(mInfo.year, mInfo.month - 1, 10);
        const baseFee = student.monthlyFee;
        const prevDues = (mInfo.month === 9) ? student.previousOutstandingDues : 0;
        const totalPayable = baseFee + prevDues;

        // Payment status distribution:
        // ~65% Paid in full
        // ~15% Partially paid
        // ~15% Unpaid
        // ~5% Overdue
        let status = 'paid';
        let paidAmount = totalPayable;
        let balance = 0;

        if (mInfo.month === 11) { // Current month has more pending/overdue
          if (sIdx % 10 === 0) {
            status = 'overdue';
            paidAmount = 0;
            balance = totalPayable;
          } else if (sIdx % 7 === 0) {
            status = 'partial';
            paidAmount = Math.floor(totalPayable * 0.5);
            balance = totalPayable - paidAmount;
          } else if (sIdx % 5 === 0) {
            status = 'unpaid';
            paidAmount = 0;
            balance = totalPayable;
          }
        } else {
          // Past months mostly paid
          if (sIdx % 12 === 0) {
            status = 'partial';
            paidAmount = Math.floor(totalPayable * 0.6);
            balance = totalPayable - paidAmount;
          }
        }

        const invoice = await FeeInvoice.create({
          invoiceNumber: invoiceNum,
          student: student._id,
          month: mInfo.month,
          year: mInfo.year,
          dueDate,
          baseFee,
          previousDues: prevDues,
          totalPayable,
          paidAmount,
          balance,
          status,
          isDemoRecord: true
        });

        // Record payment for paid / partial invoices
        if (paidAmount > 0) {
          rcpCounter++;
          const receiptNumber = `RCP-${mInfo.year}${String(mInfo.month).padStart(2, '0')}-${String(rcpCounter).padStart(4, '0')}`;
          const methods = ['upi', 'cash', 'bank_transfer', 'card'];
          const paymentMethod = methods[sIdx % methods.length];

          await Payment.create({
            receiptNumber,
            invoice: invoice._id,
            student: student._id,
            amount: paidAmount,
            paymentMethod,
            paymentDate: new Date(mInfo.year, mInfo.month - 1, (sIdx % 8) + 2),
            feeMonth: mInfo.month,
            feeYear: mInfo.year,
            previousBalance: totalPayable,
            remainingBalance: balance,
            transactionReference: paymentMethod === 'upi' ? `UPI${Date.now() + sIdx}` : (paymentMethod === 'card' ? `AUTH${900000 + sIdx}` : ''),
            notes: status === 'partial' ? 'First installment paid; remaining due next week.' : 'Full term payment received.',
            recordedBy: academyAdmin._id,
            status: 'success',
            isDemoRecord: true
          });
        }
      }
    }
  }

  // 8. Generate 3 Months Attendance History across batches
  const existingAttendance = await Attendance.countDocuments();
  if (existingAttendance === 0) {
    console.log('[Seed] Generating 3 months of attendance history across batches...');
    // Create attendance logs for 3 sessions per week over past 12 weeks
    const today = new Date();
    for (const batch of batches) {
      const batchStudents = students.filter(s => s.batch.toString() === batch._id.toString() && s.status === 'active');
      if (batchStudents.length === 0) continue;

      for (let dayOffset = 84; dayOffset >= 0; dayOffset -= 3) {
        const attDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOffset);
        attDate.setHours(0, 0, 0, 0);

        const records = batchStudents.map((st, idx) => {
          // ~85% present, ~10% absent, ~5% late
          const rand = (idx + dayOffset) % 100;
          let status = 'present';
          let remark = '';
          if (rand > 90) {
            status = 'absent';
            remark = 'Informed parent via call';
          } else if (rand > 82) {
            status = 'late';
            remark = '10 mins delay - heavy traffic';
          }
          return {
            student: st._id,
            status,
            remark
          };
        });

        await Attendance.create({
          date: attDate,
          sport: batch.sport,
          batch: batch._id,
          records,
          markedBy: academyAdmin._id,
          auditLog: [{
            action: 'CREATE',
            modifiedBy: academyAdmin._id,
            modifierName: 'Pooja Kashyap',
            reason: 'Batch attendance logged',
            timestamp: attDate
          }]
        });
      }
    }
  }

  console.log('[Seed] Database seeding completed successfully.');
  return {
    sports: Object.keys(sportsMap).length,
    coaches: coaches.length,
    batches: batches.length,
    students: students.length,
    invoices: await FeeInvoice.countDocuments(),
    payments: await Payment.countDocuments(),
    attendanceRecords: await Attendance.countDocuments()
  };
};

const resetDemoData = async () => {
  console.log('[Seed] Resetting demo records...');
  await Student.deleteMany({ isDemoRecord: true });
  await FeeInvoice.deleteMany({ isDemoRecord: true });
  await Payment.deleteMany({ isDemoRecord: true });
  await Attendance.deleteMany({});
  await AuditLog.deleteMany({});
  return await seedDatabase();
};

module.exports = {
  seedDatabase,
  resetDemoData
};
