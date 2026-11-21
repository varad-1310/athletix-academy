# ATHLETIX ACADEMY – Complete Sports Academy Management System

> **Train Smarter. Manage Better. Perform Stronger.**

ATHLETIX ACADEMY is a complete, production-oriented Sports Academy Management System engineered with a premium blue & white neumorphic design system, robust MongoDB data architecture, role-based access control, accurate financial tracking, printable receipts, and automated attendance audits.

---

## 🏆 System Highlights & Features

1. **Neumorphic UI/UX Design System**:
   - Palette: Background `#E4ECF7`, Primary Blue `#4D83D7`, Dark Text `#35445F`, Secondary `#8491A7`, Success `#22A477`, Warning `#E5A23A`, Danger `#DE5965`.
   - Realistic soft outer and inset neumorphic shadows with Inter typography.
   - Fully responsive for Desktop, Laptop, Tablet, and Mobile screens.

2. **Real Database-Driven Executive Dashboard**:
   - Total students (Active vs Inactive).
   - Realized Monthly Revenue, Pending Dues, and Overdue Fees.
   - Daily attendance turnout percentage.
   - Interactive Recharts: Monthly Collection vs Total Invoiced, Sport-wise Enrollment Distribution, Batch Capacity Utilization, and Daily Turnout Trend.

3. **Athlete Management**:
   - Auto-generated Student IDs (`ATX-YYYY-XXXX`).
   - Full student profile with photo avatar, parent details, emergency contact, medical notes.
   - Batch capacity limit constraint enforcement (cannot assign beyond batch capacity).
   - Search by name, ID, phone, or email.
   - Multi-field filters: Sport, Batch, Fee Status (Paid / Pending / Overdue), Status.
   - One-click CSV and Excel export (`.xlsx`).

4. **Training Batches & Capacity Control**:
   - Support for multiple sports (Cricket, Football, Badminton, Basketball, Swimming, Tennis, Volleyball, Athletics).
   - Schedule, start/end timing, training days, coach assignment.
   - Visual capacity utilization meter (e.g., `18/20 (90%)`).
   - Enrolled athletes modal view per batch.

5. **Coaching Staff Roster**:
   - Coach credentials, contact info, specialization, experience, and salary.
   - Dynamic tracking of active students assigned and batches led.

6. **Attendance Management**:
   - Batch and date selector with duplicate prevention.
   - Mark Present, Absent, or Late with delay reasons.
   - Bulk marking (`Mark All Present`, `Mark All Absent`).
   - Audit trail tracking who modified the attendance with reason.
   - Monthly session ledger and turnout percentage calculations.
   - Export attendance reports to Excel.

7. **Fees & Financial Management**:
   - **Accurate Financial Formula**:
     $$\text{Remaining Balance} = \text{Previous Balance} + \text{Amount Due} - \text{Payments Allocated}$$
   - Support for UPI, Cash, Bank Transfer, and Card payments.
   - Unique Receipt ID generation (`RCP-YYYYMM-XXXX`).
   - **Printable PDF Receipt** with academy branding, fee breakdown, previous balance, paid amount, and remaining balance.
   - **WhatsApp Fee Reminder Integration**: Pre-filled customizable reminder with direct WhatsApp link (messages are never sent automatically without manual authorization).
   - **Authorized Payment Reversal**: Allows reversing payments with audit trail, safely restoring the student's outstanding balance.

8. **Executive Reports & Analytics**:
   - Revenue collection ledger, registrations roster, coach allocation, and pending dues.
   - Date range, sport, and batch filters with full Excel workbook export.

9. **Security & RBAC**:
   - 3-tier Role-Based Access Control: **Super Admin**, **Academy Admin**, and **Coach**.
   - JWT authentication and bcrypt password hashing.
   - Audit logging for financial and operational records.

10. **Pre-Seeded Realistic Demo Dataset**:
    - **120 Students**, **8 Coaches**, **10 Batches**, **3 Months of Invoices & Payments** with diverse statuses (Paid, Partial, Overdue), and **3 Months of Attendance Sessions**.
    - Safe Demo Reset utility requiring confirmation `RESET_DEMO_DATA`.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@athletix.com` | `Password@123` | Full system access, user management, academy settings |
| **Academy Admin** | `admin@athletix.com` | `Password@123` | Student CRUD, batches, coaches, payments, attendance, reports |
| **Coach** | `coach.rohit@athletix.com` | `Password@123` | View assigned batches & athletes, mark daily attendance |

> *Note: The login page includes 1-click quick login buttons to switch between demo roles instantaneously.*

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+ recommended, v24 supported)
- npm or pnpm

### 1. Backend Setup
```bash
cd server
npm install
npm run seed     # Seeds 120 students, 8 coaches, 10 batches, and 3 months of history
npm start        # Starts server on http://localhost:5000
```
*(If local MongoDB is not running, the server automatically starts an embedded in-memory MongoDB database instance so the app runs immediately without external dependencies.)*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Running Automated Tests

To run the automated test suite verifying auth, batch capacity checks, duplicate attendance prevention, and financial balance calculations:
```bash
cd server
npm test
```

Expected result:
```
========================================
TEST SUMMARY: 18 PASSED, 0 FAILED
========================================
```

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Import repository on Vercel.
2. Root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend (Render / Railway)
1. Create Web Service pointing to `server/`.
2. Build command: `npm install`
3. Start command: `node server.js`
4. Set Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/athletix?retryWrites=true&w=majority`
   - `JWT_SECRET=your_production_secret_key`

---

## 📁 Project Architecture

```
athletix-academy/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── ConfirmationDialog.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Navbar.jsx
│   │   │       ├── Pagination.jsx
│   │   │       ├── PrintableReceipt.jsx
│   │   │       ├── QuickPaymentModal.jsx
│   │   │       ├── QuickStudentModal.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── StatCard.jsx
│   │   │       └── WhatsAppReminderModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/
│   │   │   ├── Attendance.jsx
│   │   │   ├── Batches.jsx
│   │   │   ├── Coaches.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── StudentDetail.jsx
│   │   │   └── Students.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── jwt.js
│   ├── controllers/
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── batchController.js
│   │   ├── coachController.js
│   │   ├── dashboardController.js
│   │   ├── demoController.js
│   │   ├── paymentController.js
│   │   ├── reportController.js
│   │   ├── settingsController.js
│   │   ├── sportController.js
│   │   └── studentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── AcademySettings.js
│   │   ├── Attendance.js
│   │   ├── AuditLog.js
│   │   ├── Batch.js
│   │   ├── Coach.js
│   │   ├── FeeInvoice.js
│   │   ├── FeePlan.js
│   │   ├── Payment.js
│   │   ├── Sport.js
│   │   ├── Student.js
│   │   └── User.js
│   ├── routes/
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── batchRoutes.js
│   │   ├── coachRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── demoRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── sportRoutes.js
│   │   └── studentRoutes.js
│   ├── seed/
│   │   ├── seedData.js
│   │   └── seedRunner.js
│   ├── services/
│   │   ├── attendanceService.js
│   │   └── feeService.js
│   ├── tests/
│   │   └── runTests.js
│   ├── package.json
│   └── server.js
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔒 License
Proprietary Client Project — ATHLETIX ACADEMY. All rights reserved.
