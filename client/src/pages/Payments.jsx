import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/common/Pagination';
import PrintableReceipt from '../components/common/PrintableReceipt';
import QuickPaymentModal from '../components/common/QuickPaymentModal';
import WhatsAppReminderModal from '../components/common/WhatsAppReminderModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import * as XLSX from 'xlsx';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Printer,
  RotateCcw,
  MessageSquare,
  Download,
  AlertTriangle,
  Calendar,
  IndianRupee,
  FileCheck
} from 'lucide-react';

const Payments = () => {
  const { isCoach, isSuperAdmin, isAcademyAdmin } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'invoices'

  // Payments State
  const [payments, setPayments] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentsPages, setPaymentsPages] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);

  // Invoices State
  const [invoices, setInvoices] = useState([]);
  const [invoicesTotal, setInvoicesTotal] = useState(0);
  const [invoicesPages, setInvoicesPages] = useState(1);
  const [invoicesPage, setInvoicesPage] = useState(1);

  // Shared Filters
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');
  const [month, setMonth] = useState('all');
  const [loading, setLoading] = useState(false);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedWaStudent, setSelectedWaStudent] = useState(null);
  const [paymentToReverse, setPaymentToReverse] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    } else {
      fetchInvoices();
    }
  }, [activeTab, search, method, status, month, paymentsPage, invoicesPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments', {
        params: { search, method, status, month, page: paymentsPage, limit: 15 }
      });
      if (res.data.success) {
        setPayments(res.data.data);
        setPaymentsTotal(res.data.total);
        setPaymentsPages(res.data.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/invoices', {
        params: { search, status, month, page: invoicesPage, limit: 15 }
      });
      if (res.data.success) {
        setInvoices(res.data.data);
        setInvoicesTotal(res.data.total);
        setInvoicesPages(res.data.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReverseConfirm = async () => {
    if (!paymentToReverse) return;
    if (!reversalReason) return error('Please provide a reason for payment reversal');

    setReversing(true);
    try {
      const res = await api.post(`/payments/${paymentToReverse._id}/reverse`, {
        reason: reversalReason
      });
      if (res.data.success) {
        success(res.data.message);
        setPaymentToReverse(null);
        setReversalReason('');
        fetchPayments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Payment reversal failed');
    } finally {
      setReversing(false);
    }
  };

  // Export payments ledger
  const handleExportPayments = () => {
    if (payments.length === 0) return error('No payment records to export');
    const data = payments.map(p => ({
      'Receipt #': p.receiptNumber,
      'Athlete ID': p.student?.studentId || '',
      'Athlete Name': p.student?.fullName || '',
      'Amount (INR)': p.amount,
      'Payment Method': p.paymentMethod?.toUpperCase(),
      'Payment Date': new Date(p.paymentDate).toLocaleDateString('en-GB'),
      'Fee Month': `${p.feeMonth}/${p.feeYear}`,
      'Status': p.status?.toUpperCase()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments_Ledger');
    XLSX.writeFile(wb, `Athletix_Payments_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    success(`Exported ${data.length} payment records!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header Card */}
      <div className="neu-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-text)' }}>
              Fee Collection & Financial Management
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--secondary-text)' }}>
              Accurate balance calculation, printable receipts, reversals and WhatsApp reminders
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportPayments}
            >
              <Download size={16} /> Export Ledger
            </button>

            {!isCoach && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsRecordModalOpen(true)}
              >
                <Plus size={18} /> Collect Fees & Generate Receipt
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher & Filter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className={activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.88rem' }}
              onClick={() => {
                setActiveTab('payments');
                setStatus('all');
              }}
            >
              <CreditCard size={16} /> Recorded Payments ({paymentsTotal})
            </button>
            <button
              type="button"
              className={activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.88rem' }}
              onClick={() => {
                setActiveTab('invoices');
                setStatus('all');
              }}
            >
              <FileCheck size={16} /> Invoices & Dues ({invoicesTotal})
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="neu-input"
                style={{ paddingLeft: 34, width: 220, padding: '8px 12px 8px 34px', fontSize: '0.85rem' }}
                placeholder="Search athlete or receipt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} color="var(--secondary-text)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {activeTab === 'payments' ? (
              <select
                className="neu-select"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="all">All Payment Methods</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            ) : (
              <select
                className="neu-select"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Invoice Statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>
            )}

            <select
              className="neu-select"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab 1: Payments Table */}
      {activeTab === 'payments' && (
        <div className="neu-card" style={{ padding: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Receipt #</th>
                <th style={{ padding: '12px 14px' }}>Athlete Details</th>
                <th style={{ padding: '12px 14px' }}>Amount Paid</th>
                <th style={{ padding: '12px 14px' }}>Method</th>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary-blue)', fontSize: '0.88rem' }}>
                      {p.receiptNumber}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--dark-text)' }}>
                        {p.student?.fullName || 'Athlete'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                        ID: {p.student?.studentId} • {p.student?.sport}
                      </div>
                    </td>

                    <td style={{ padding: '14px', fontWeight: 800, color: 'var(--dark-text)', fontSize: '0.98rem' }}>
                      ₹{(p.amount || 0).toLocaleString()}
                    </td>

                    <td style={{ padding: '14px', textTransform: 'uppercase', fontSize: '0.82rem', fontWeight: 600 }}>
                      {p.paymentMethod}
                    </td>

                    <td style={{ padding: '14px', fontSize: '0.85rem' }}>
                      {new Date(p.paymentDate).toLocaleDateString('en-GB')}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${p.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                        {p.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          onClick={() => setSelectedReceipt(p)}
                        >
                          <Printer size={15} /> Receipt
                        </button>

                        {!isCoach && p.status === 'success' && (
                          <button
                            type="button"
                            className="neu-card-flat"
                            style={{ padding: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                            title="Reverse Payment"
                            onClick={() => setPaymentToReverse(p)}
                          >
                            <RotateCcw size={16} color="var(--danger)" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={paymentsPage}
            totalPages={paymentsPages}
            totalItems={paymentsTotal}
            itemsPerPage={15}
            onPageChange={(p) => setPaymentsPage(p)}
          />
        </div>
      )}

      {/* Tab 2: Invoices & Dues Table */}
      {activeTab === 'invoices' && (
        <div className="neu-card" style={{ padding: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Invoice #</th>
                <th style={{ padding: '12px 14px' }}>Athlete Name</th>
                <th style={{ padding: '12px 14px' }}>Period</th>
                <th style={{ padding: '12px 14px' }}>Base Fee</th>
                <th style={{ padding: '12px 14px' }}>Total Due</th>
                <th style={{ padding: '12px 14px' }}>Paid</th>
                <th style={{ padding: '12px 14px' }}>Balance</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                    No invoice records found.
                  </td>
                </tr>
              ) : (
                invoices.map(inv => {
                  let badge = 'badge-success';
                  if (inv.status === 'partial') badge = 'badge-warning';
                  if (inv.status === 'unpaid' || inv.status === 'overdue') badge = 'badge-danger';

                  return (
                    <tr key={inv._id} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                      <td style={{ padding: '14px', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--dark-text)' }}>{inv.student?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>{inv.student?.sport}</div>
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.85rem' }}>Month {inv.month}/{inv.year}</td>
                      <td style={{ padding: '14px' }}>₹{(inv.baseFee || 0).toLocaleString()}</td>
                      <td style={{ padding: '14px', fontWeight: 700 }}>₹{(inv.totalPayable || 0).toLocaleString()}</td>
                      <td style={{ padding: '14px', color: 'var(--success)', fontWeight: 600 }}>₹{(inv.paidAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '14px', color: inv.balance > 0 ? 'var(--danger)' : 'var(--dark-text)', fontWeight: 800 }}>
                        ₹{(inv.balance || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${badge}`}>{inv.status}</span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {inv.balance > 0 && (
                            <>
                              <button
                                type="button"
                                className="neu-card-flat"
                                style={{ padding: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                                title="Send WhatsApp Reminder"
                                onClick={() => setSelectedWaStudent({ ...inv.student, dueAmount: inv.balance })}
                              >
                                <MessageSquare size={16} color="#22A477" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={invoicesPage}
            totalPages={invoicesPages}
            totalItems={invoicesTotal}
            itemsPerPage={15}
            onPageChange={(p) => setInvoicesPage(p)}
          />
        </div>
      )}

      {/* Record Payment Modal */}
      <QuickPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onPaymentRecorded={() => {
          fetchPayments();
          fetchInvoices();
        }}
      />

      {/* Printable Receipt */}
      {selectedReceipt && (
        <PrintableReceipt
          isOpen={true}
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* WhatsApp Reminder */}
      {selectedWaStudent && (
        <WhatsAppReminderModal
          isOpen={true}
          student={selectedWaStudent}
          dueAmount={selectedWaStudent.dueAmount}
          onClose={() => setSelectedWaStudent(null)}
        />
      )}

      {/* Payment Reversal Confirmation with Reason */}
      {paymentToReverse && (
        <ConfirmationDialog
          isOpen={true}
          title={`Reverse Payment: ${paymentToReverse.receiptNumber}?`}
          message={
            <div>
              <p style={{ marginBottom: 12 }}>
                Reversing this payment of <strong>₹{(paymentToReverse.amount || 0).toLocaleString()}</strong> will automatically restore the student's outstanding due balance and mark the invoice unpaid/partial.
              </p>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', marginBottom: 4 }}>
                Reversal Authorization Reason *
              </label>
              <input
                type="text"
                required
                className="neu-input"
                placeholder="e.g. Chargeback, duplicate payment, cheque bounce"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
              />
            </div>
          }
          confirmText={reversing ? 'Reversing...' : 'Authorize Reversal'}
          isDanger={true}
          onConfirm={handleReverseConfirm}
          onClose={() => {
            setPaymentToReverse(null);
            setReversalReason('');
          }}
        />
      )}
    </div>
  );
};

export default Payments;
