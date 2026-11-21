import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import PrintableReceipt from './PrintableReceipt';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CreditCard, Printer } from 'lucide-react';

const QuickPaymentModal = ({ isOpen, onClose, onPaymentRecorded, preselectedStudent = null }) => {
  const { success, error } = useToast();
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [feeMonth, setFeeMonth] = useState(new Date().getMonth() + 1);
  const [feeYear, setFeeYear] = useState(new Date().getFullYear());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
      if (preselectedStudent) {
        setStudentId(preselectedStudent._id);
        fetchStudentFinancials(preselectedStudent._id);
      }
    }
  }, [isOpen, preselectedStudent]);

  const loadStudents = async () => {
    try {
      const res = await api.get('/students?limit=200');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load students', err);
    }
  };

  const fetchStudentFinancials = async (id) => {
    try {
      const res = await api.get(`/students/${id}`);
      if (res.data.success) {
        setSelectedStudentData(res.data.data);
        const outstanding = res.data.data.financials?.currentOutstanding || res.data.data.student.monthlyFee;
        setAmount(outstanding);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentSelect = (id) => {
    setStudentId(id);
    if (id) fetchStudentFinancials(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !amount || Number(amount) <= 0) {
      return error('Please select student and enter a valid positive payment amount');
    }

    setLoading(true);
    try {
      const res = await api.post('/payments', {
        studentId,
        amount: Number(amount),
        paymentMethod,
        feeMonth,
        feeYear,
        notes
      });

      if (res.data.success) {
        success(`Payment of ₹${Number(amount).toLocaleString()} recorded successfully!`);
        setCreatedReceipt(res.data.data.receipt);
        if (onPaymentRecorded) onPaymentRecorded(res.data.data.payment);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen && !createdReceipt} onClose={onClose} title="Collect Fees & Record Payment" subtitle="Instant fee payment recording with receipt generation" maxWidth={620}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Select Student *
            </label>
            <select
              className="neu-select"
              required
              value={studentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
            >
              <option value="">-- Choose Athlete --</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.fullName} ({s.studentId}) - {s.sport}
                </option>
              ))}
            </select>
          </div>

          {selectedStudentData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14, background: 'rgba(77, 131, 215, 0.08)', borderRadius: 12, border: '1px solid rgba(77, 131, 215, 0.2)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Monthly Base Fee</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-text)' }}>
                  ₹{(selectedStudentData.student.monthlyFee || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Current Outstanding Due</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)' }}>
                  ₹{(selectedStudentData.financials?.currentOutstanding || 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                className="neu-input"
                placeholder="Amount in ₹"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Payment Method *
              </label>
              <select
                className="neu-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="card">Credit / Debit Card</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Billing Month *
              </label>
              <select
                className="neu-select"
                value={feeMonth}
                onChange={(e) => setFeeMonth(Number(e.target.value))}
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Billing Year *
              </label>
              <input
                type="number"
                className="neu-input"
                value={feeYear}
                onChange={(e) => setFeeYear(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Notes / Transaction ID (Optional)
            </label>
            <input
              type="text"
              className="neu-input"
              placeholder="e.g. UTR / Ref # / Part-payment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !studentId || !amount}>
              <CreditCard size={18} /> {loading ? 'Processing...' : 'Record Payment & Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Show receipt popup once generated */}
      {createdReceipt && (
        <PrintableReceipt
          isOpen={true}
          receipt={createdReceipt}
          onClose={() => {
            setCreatedReceipt(null);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default QuickPaymentModal;
