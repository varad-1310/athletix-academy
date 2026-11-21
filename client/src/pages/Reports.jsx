import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  IndianRupee,
  Users,
  Trophy,
  Layers,
  Printer
} from 'lucide-react';

const Reports = () => {
  const { success, error } = useToast();

  const [reportData, setReportData] = useState(null);
  const [sports, setSports] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [sport, setSport] = useState('all');
  const [batchId, setBatchId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportView, setReportView] = useState('revenue'); // 'revenue' | 'registrations' | 'coaches' | 'dues'

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [sport, batchId, startDate, endDate]);

  const fetchMetadata = async () => {
    try {
      const [sRes, bRes] = await Promise.all([
        api.get('/sports'),
        api.get('/batches')
      ]);
      if (sRes.data.success) setSports(sRes.data.data);
      if (bRes.data.success) setBatches(bRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports', {
        params: { sport, batchId, startDate, endDate }
      });
      if (res.data.success) {
        setReportData(res.data.reportData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    const wb = XLSX.utils.book_new();

    // 1. Revenue sheet
    if (reportData.payments?.length > 0) {
      const pRows = reportData.payments.map(p => ({
        'Receipt #': p.receiptNumber,
        'Athlete': p.student?.fullName || '',
        'Sport': p.student?.sport || '',
        'Amount': p.amount,
        'Date': new Date(p.paymentDate).toLocaleDateString('en-GB'),
        'Method': p.paymentMethod?.toUpperCase()
      }));
      const pSheet = XLSX.utils.json_to_sheet(pRows);
      XLSX.utils.book_append_sheet(wb, pSheet, 'Revenue_Ledger');
    }

    // 2. Registrations sheet
    if (reportData.registrations?.length > 0) {
      const rRows = reportData.registrations.map(r => ({
        'Student ID': r.studentId,
        'Full Name': r.fullName,
        'Sport': r.sport,
        'Batch': r.batch?.name || '',
        'Coach': r.coach?.name || '',
        'Joining Date': new Date(r.joiningDate).toLocaleDateString('en-GB')
      }));
      const rSheet = XLSX.utils.json_to_sheet(rRows);
      XLSX.utils.book_append_sheet(wb, rSheet, 'Registrations');
    }

    // 3. Outstanding Dues
    if (reportData.pendingInvoices?.length > 0) {
      const dRows = reportData.pendingInvoices.map(inv => ({
        'Invoice #': inv.invoiceNumber,
        'Athlete': inv.student?.fullName || '',
        'Parent Phone': inv.student?.parentPhone || '',
        'Period': `${inv.month}/${inv.year}`,
        'Balance Due': inv.balance,
        'Status': inv.status?.toUpperCase()
      }));
      const dSheet = XLSX.utils.json_to_sheet(dRows);
      XLSX.utils.book_append_sheet(wb, dSheet, 'Outstanding_Dues');
    }

    XLSX.writeFile(wb, `Athletix_Academy_Full_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    success('Comprehensive sports academy report exported successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Controls */}
      <div className="neu-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-text)' }}>
              Analytics & Executive Reports
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--secondary-text)' }}>
              Comprehensive operational, revenue, coaching load and outstanding fee reports
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print Report
            </button>
            <button type="button" className="btn-primary" onClick={handleExportExcel}>
              <Download size={16} /> Export Complete Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 20 }}>
          <select
            className="neu-select"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          >
            <option value="all">All Sports</option>
            {sports.map(s => (
              <option key={s._id} value={s.name}>{s.name}</option>
            ))}
          </select>

          <select
            className="neu-select"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          >
            <option value="all">All Batches</option>
            {batches.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>

          <input
            type="date"
            className="neu-input"
            placeholder="From Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="neu-input"
            placeholder="To Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          <button
            type="button"
            className={reportView === 'revenue' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setReportView('revenue')}
          >
            <IndianRupee size={16} /> Revenue & Payments Ledger
          </button>
          <button
            type="button"
            className={reportView === 'registrations' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setReportView('registrations')}
          >
            <Users size={16} /> Athlete Registrations ({reportData?.totalStudentsCount || 0})
          </button>
          <button
            type="button"
            className={reportView === 'coaches' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setReportView('coaches')}
          >
            <Trophy size={16} /> Coach Allocations
          </button>
          <button
            type="button"
            className={reportView === 'dues' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setReportView('dues')}
          >
            <Layers size={16} /> Pending & Overdue Invoices
          </button>
        </div>
      </div>

      {/* Main Report Body */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: 'var(--secondary-text)' }}>
          Generating reports from database records...
        </div>
      ) : (
        <div className="neu-card printable-area" style={{ padding: 24 }}>
          {/* Revenue View */}
          {reportView === 'revenue' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-text)' }}>
                    Revenue & Collection Report
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                    Total Realized Revenue: <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>₹{(reportData?.totalRevenue || 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>Receipt #</th>
                      <th style={{ padding: '10px 12px' }}>Athlete</th>
                      <th style={{ padding: '10px 12px' }}>Sport</th>
                      <th style={{ padding: '10px 12px' }}>Date</th>
                      <th style={{ padding: '10px 12px' }}>Method</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData?.payments || []).map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>{p.receiptNumber}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{p.student?.fullName}</td>
                        <td style={{ padding: '12px' }}>{p.student?.sport}</td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(p.paymentDate).toLocaleDateString('en-GB')}</td>
                        <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '0.82rem' }}>{p.paymentMethod}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: 'var(--dark-text)' }}>
                          ₹{(p.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Registrations View */}
          {reportView === 'registrations' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 16 }}>
                Athlete Registration Rosters
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>ID</th>
                      <th style={{ padding: '10px 12px' }}>Athlete Name</th>
                      <th style={{ padding: '10px 12px' }}>Sport</th>
                      <th style={{ padding: '10px 12px' }}>Batch</th>
                      <th style={{ padding: '10px 12px' }}>Coach</th>
                      <th style={{ padding: '10px 12px' }}>Enrolled On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData?.registrations || []).map(r => (
                      <tr key={r._id} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>{r.studentId}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{r.fullName}</td>
                        <td style={{ padding: '12px' }}>{r.sport}</td>
                        <td style={{ padding: '12px' }}>{r.batch?.name || 'Unassigned'}</td>
                        <td style={{ padding: '12px' }}>{r.coach?.name || 'Staff'}</td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>{new Date(r.joiningDate).toLocaleDateString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Coach Allocation View */}
          {reportView === 'coaches' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 16 }}>
                Coach Allocation & Training Load Distribution
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {(reportData?.coachStats || []).map((cs, idx) => (
                  <div key={idx} className="neu-card-flat" style={{ padding: 18 }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-text)' }}>{cs.coachName}</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--primary-blue)', fontWeight: 600 }}>{cs.specialization}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(166, 180, 200, 0.3)' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Active Students</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{cs.studentCount}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Batches Led</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{cs.batchCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outstanding Dues View */}
          {reportView === 'dues' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 16 }}>
                Pending & Overdue Invoices Ledger
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>Invoice #</th>
                      <th style={{ padding: '10px 12px' }}>Athlete Name</th>
                      <th style={{ padding: '10px 12px' }}>Parent Phone</th>
                      <th style={{ padding: '10px 12px' }}>Period</th>
                      <th style={{ padding: '10px 12px' }}>Balance Due</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData?.pendingInvoices || []).map(inv => (
                      <tr key={inv._id} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>{inv.student?.fullName}</td>
                        <td style={{ padding: '12px' }}>{inv.student?.parentPhone}</td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>Month {inv.month}/{inv.year}</td>
                        <td style={{ padding: '12px', fontWeight: 800, color: 'var(--danger)' }}>
                          ₹{(inv.balance || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${inv.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
