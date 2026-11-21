import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PrintableReceipt from '../components/common/PrintableReceipt';
import QuickPaymentModal from '../components/common/QuickPaymentModal';
import WhatsAppReminderModal from '../components/common/WhatsAppReminderModal';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Trophy,
  Layers,
  CreditCard,
  CalendarCheck,
  Printer,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isCoach } = useAuth();
  const { success, error } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('financials'); // 'financials' | 'attendance'

  // Receipt popup state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${id}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      error('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ fontSize: '1.1rem', color: 'var(--secondary-text)' }}>
          Loading athlete profile & history...
        </div>
      </div>
    );
  }

  const { student, financials, attendance } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Back button & Action Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate('/students')}
        >
          <ArrowLeft size={18} /> Back to Athletes
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          {!isCoach && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsWaModalOpen(true)}
              >
                <MessageSquare size={16} color="#22A477" /> WhatsApp Reminder
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <CreditCard size={18} /> Record Payment
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="neu-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          <img
            src={student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.studentId}`}
            alt={student.fullName}
            style={{ width: 90, height: 90, borderRadius: '50%', background: '#FFF', border: '3px solid #CCD7E7', boxShadow: 'var(--shadow-raised-sm)' }}
          />

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-text)' }}>
                {student.fullName}
              </h2>
              <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                {student.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8, fontSize: '0.88rem', color: 'var(--secondary-text)' }}>
              <div>Athlete ID: <strong style={{ color: 'var(--primary-blue)' }}>{student.studentId}</strong></div>
              <div>Sport: <strong style={{ color: 'var(--dark-text)' }}>{student.sport}</strong></div>
              <div>Batch: <strong style={{ color: 'var(--dark-text)' }}>{student.batch?.name || 'N/A'}</strong></div>
              <div>Coach: <strong style={{ color: 'var(--dark-text)' }}>{student.coach?.name || 'Assigned Lead Coach'}</strong></div>
            </div>
          </div>

          {/* Quick Balance Pill */}
          <div
            className="neu-inset"
            style={{
              padding: '16px 24px',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'right',
              minWidth: 180
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
              Current Outstanding Due
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: financials?.currentOutstanding > 0 ? 'var(--danger)' : 'var(--success)', marginTop: 2 }}>
              ₹{(financials?.currentOutstanding || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
              Total Invoiced: ₹{(financials?.totalInvoiced || 0).toLocaleString()} • Paid: ₹{(financials?.totalPaid || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(166, 180, 200, 0.4)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Date of Birth / Age</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark-text)', marginTop: 2 }}>
              {new Date(student.dob).toLocaleDateString('en-GB')} ({student.gender})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Parent / Guardian</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark-text)', marginTop: 2 }}>
              {student.parentName} ({student.parentPhone})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Monthly Fee & Joined</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark-text)', marginTop: 2 }}>
              ₹{(student.monthlyFee || 0).toLocaleString()} / month • Joined {new Date(student.joiningDate).toLocaleDateString('en-GB')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Medical Notes</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--dark-text)', marginTop: 2 }}>
              {student.medicalNotes || 'None reported'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation: Financials vs Attendance */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          className={activeTab === 'financials' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('financials')}
        >
          <CreditCard size={18} /> Financial & Payment History
        </button>

        <button
          type="button"
          className={activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('attendance')}
        >
          <CalendarCheck size={18} /> Attendance Records ({attendance?.percentage || 0}%)
        </button>
      </div>

      {/* Tab 1: Financial & Payment History */}
      {activeTab === 'financials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Payment Receipts Table */}
          <div className="neu-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-text)', marginBottom: 16 }}>
              Recorded Payments & Issued Receipts
            </h3>

            {financials?.payments?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--secondary-text)' }}>
                No payment transactions recorded for this student yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>Receipt #</th>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Billing Month</th>
                      <th style={{ padding: '10px 12px' }}>Amount Paid</th>
                      <th style={{ padding: '10px 12px' }}>Method</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Print Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financials.payments.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>
                          {p.receiptNumber}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                          {new Date(p.paymentDate).toLocaleDateString('en-GB')}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                          Month {p.feeMonth}/{p.feeYear}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--dark-text)' }}>
                          ₹{(p.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '0.82rem' }}>
                          {p.paymentMethod}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${p.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={() => setSelectedReceipt({ ...p, student })}
                          >
                            <Printer size={15} /> Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fee Invoices Breakdown */}
          <div className="neu-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-text)', marginBottom: 16 }}>
              Monthly Invoices Breakdown
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Invoice #</th>
                    <th style={{ padding: '10px 12px' }}>Period</th>
                    <th style={{ padding: '10px 12px' }}>Base Fee</th>
                    <th style={{ padding: '10px 12px' }}>Previous Dues</th>
                    <th style={{ padding: '10px 12px' }}>Total Payable</th>
                    <th style={{ padding: '10px 12px' }}>Paid</th>
                    <th style={{ padding: '10px 12px' }}>Balance</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(financials?.invoices || []).map(inv => {
                    let badgeClass = 'badge-success';
                    if (inv.status === 'partial') badgeClass = 'badge-warning';
                    if (inv.status === 'unpaid' || inv.status === 'overdue') badgeClass = 'badge-danger';

                    return (
                      <tr key={inv._id} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>Month {inv.month}/{inv.year}</td>
                        <td style={{ padding: '12px' }}>₹{(inv.baseFee || 0).toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>₹{(inv.previousDues || 0).toLocaleString()}</td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>₹{(inv.totalPayable || 0).toLocaleString()}</td>
                        <td style={{ padding: '12px', color: 'var(--success)', fontWeight: 600 }}>₹{(inv.paidAmount || 0).toLocaleString()}</td>
                        <td style={{ padding: '12px', color: inv.balance > 0 ? 'var(--danger)' : 'var(--dark-text)', fontWeight: 700 }}>
                          ₹{(inv.balance || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${badgeClass}`}>{inv.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance History & Percentage */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Attendance KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="neu-card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', fontWeight: 600 }}>OVERALL ATTENDANCE</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-blue)', marginTop: 4 }}>
                {attendance?.percentage || 0}%
              </div>
            </div>

            <div className="neu-card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', fontWeight: 600 }}>TOTAL SESSIONS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-text)', marginTop: 4 }}>
                {attendance?.totalSessions || 0}
              </div>
            </div>

            <div className="neu-card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', fontWeight: 600 }}>PRESENT SESSIONS</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
                {attendance?.presentCount || 0}
              </div>
            </div>

            <div className="neu-card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', fontWeight: 600 }}>ABSENT / LATE</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)', marginTop: 4 }}>
                {attendance?.absentCount || 0} / {attendance?.lateCount || 0}
              </div>
            </div>
          </div>

          {/* Session by Session Attendance List */}
          <div className="neu-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-text)', marginBottom: 16 }}>
              Session-by-Session Attendance Logs
            </h3>

            {attendance?.history?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--secondary-text)' }}>
                No attendance sessions logged for this student yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Sport</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Notes / Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.history.map((h, idx) => {
                      let badge = 'badge-success';
                      if (h.status === 'absent') badge = 'badge-danger';
                      if (h.status === 'late') badge = 'badge-warning';

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>
                            {new Date(h.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '12px' }}>{h.sport}</td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge ${badge}`}>{h.status}</span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                            {h.remark || 'Regular session completed'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <PrintableReceipt
          isOpen={true}
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Record Payment Modal */}
      <QuickPaymentModal
        isOpen={isPaymentModalOpen}
        preselectedStudent={student}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentRecorded={() => fetchStudentData()}
      />

      {/* WhatsApp Modal */}
      <WhatsAppReminderModal
        isOpen={isWaModalOpen}
        student={student}
        dueAmount={financials?.currentOutstanding || student.monthlyFee}
        onClose={() => setIsWaModalOpen(false)}
      />
    </div>
  );
};

export default StudentDetail;
