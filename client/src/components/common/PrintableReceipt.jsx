import React from 'react';
import { Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import Modal from './Modal';

const PrintableReceipt = ({ isOpen, onClose, receipt }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Payment Receipt" maxWidth={680}>
      <div className="printable-area" id="receipt-printable" style={{ padding: '8px 4px' }}>
        {/* Receipt Container */}
        <div
          style={{
            border: '2px dashed #9BB3D1',
            borderRadius: 16,
            padding: 32,
            backgroundColor: '#FFFFFF',
            color: '#1E293B'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E2E8F0', paddingBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#4D83D7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800 }}>
                  A
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}>
                  ATHLETIX ACADEMY
                </h2>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 4 }}>
                Train Smarter. Manage Better. Perform Stronger.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Plot 42, Olympic Avenue, Sports City • contact@athletixacademy.com
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'inline-block', padding: '4px 10px', background: '#ECFDF5', color: '#059669', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700 }}>
                PAYMENT CONFIRMED
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginTop: 6 }}>
                {receipt.receiptNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Date: {new Date(receipt.paymentDate || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Student & Payment Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '24px 0', background: '#F8FAFC', padding: 16, borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Student Information</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                {receipt.studentName || receipt.student?.fullName}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                ID: {receipt.studentId || receipt.student?.studentId}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Sport: <strong>{receipt.sport || receipt.student?.sport}</strong>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Parent / Contact</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B', marginTop: 2 }}>
                {receipt.parentName || receipt.student?.parentName || 'Parent / Guardian'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Phone: {receipt.parentPhone || receipt.student?.parentPhone}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Method: <strong style={{ textTransform: 'uppercase' }}>{receipt.paymentMethod}</strong>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '8px 0' }}>Description</th>
                <th style={{ padding: '8px 0', textAlign: 'center' }}>Billing Period</th>
                <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>
                  Sports Training Academy Membership
                </td>
                <td style={{ padding: '12px 0', textAlign: 'center', color: '#64748B' }}>
                  {monthNames[receipt.feeMonth]} {receipt.feeYear}
                </td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700 }}>
                  ₹{(receipt.amountPaid || receipt.amount || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Financial Calculation Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <div style={{ width: 280, fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
                <span>Previous Balance:</span>
                <span>₹{(receipt.previousBalance || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#0F172A', fontWeight: 700, borderTop: '1px solid #E2E8F0', fontSize: '1rem' }}>
                <span>Amount Paid:</span>
                <span style={{ color: '#059669' }}>₹{(receipt.amountPaid || receipt.amount || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#DC2626', fontWeight: 600, borderTop: '1px solid #E2E8F0' }}>
                <span>Remaining Balance:</span>
                <span>₹{(receipt.remainingBalance !== undefined ? receipt.remainingBalance : 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer & Seal */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#64748B' }}>
              <ShieldCheck size={18} color="#059669" />
              <span>Computer-generated valid receipt. Signature not required.</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', textAlign: 'right' }}>
              Recorded By: <strong>{receipt.recordedBy || 'System Admin'}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={handlePrint}>
            <Printer size={18} /> Print / Save PDF Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PrintableReceipt;
