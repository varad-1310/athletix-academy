import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/common/Pagination';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import QuickStudentModal from '../components/common/QuickStudentModal';
import QuickPaymentModal from '../components/common/QuickPaymentModal';
import WhatsAppReminderModal from '../components/common/WhatsAppReminderModal';
import * as XLSX from 'xlsx';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  MessageSquare,
  ArrowUpDown
} from 'lucide-react';

const Students = () => {
  const { isCoach } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Query State
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('all');
  const [batch, setBatch] = useState('all');
  const [feeStatus, setFeeStatus] = useState('all');
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Metadata dropdowns
  const [sportsList, setSportsList] = useState([]);
  const [batchesList, setBatchesList] = useState([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paymentModalStudent, setPaymentModalStudent] = useState(null);
  const [waModalStudent, setWaModalStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const fetchFilterData = async () => {
    try {
      const [sRes, bRes] = await Promise.all([
        api.get('/sports'),
        api.get('/batches')
      ]);
      if (sRes.data.success) setSportsList(sRes.data.data);
      if (bRes.data.success) setBatchesList(bRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students', {
        params: {
          search,
          sport,
          batch,
          feeStatus,
          status,
          page,
          sortBy,
          sortOrder,
          limit: 15
        }
      });
      if (res.data.success) {
        setStudents(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error('Error fetching students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, sport, batch, feeStatus, status, page, sortBy, sortOrder]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await api.delete(`/students/${studentToDelete._id}`);
      if (res.data.success) {
        success(res.data.message);
        fetchStudents();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to deactivate student');
    } finally {
      setStudentToDelete(null);
    }
  };

  // Export to CSV & Excel using xlsx
  const handleExport = async (format = 'xlsx') => {
    try {
      const res = await api.get('/students', {
        params: { exportAll: 'true', sport, batch, status }
      });
      if (res.data.success && res.data.data.length > 0) {
        const exportData = res.data.data.map(s => ({
          'Student ID': s.studentId,
          'Full Name': s.fullName,
          'Sport': s.sport,
          'Batch': s.batch?.name || '',
          'Coach': s.coach?.name || '',
          'Gender': s.gender,
          'Parent Name': s.parentName,
          'Parent Phone': s.parentPhone,
          'Monthly Fee (INR)': s.monthlyFee,
          'Status': s.status
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Athletix_Students');

        if (format === 'csv') {
          XLSX.writeFile(wb, `Athletix_Students_${new Date().toISOString().slice(0, 10)}.csv`);
        } else {
          XLSX.writeFile(wb, `Athletix_Students_${new Date().toISOString().slice(0, 10)}.xlsx`);
        }
        success(`Successfully exported ${exportData.length} student records!`);
      }
    } catch (err) {
      error('Failed to export students data');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Controls Header */}
      <div className="neu-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-text)' }}>
              Athlete Directory
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--secondary-text)' }}>
              Total {total} registered athletes in database
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {/* Export Buttons */}
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
              onClick={() => handleExport('xlsx')}
            >
              <Download size={16} /> Export Excel
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
              onClick={() => handleExport('csv')}
            >
              <Download size={16} /> CSV
            </button>

            {!isCoach && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={18} /> Register Student
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 20 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <input
              type="text"
              className="neu-input"
              style={{ paddingLeft: 38 }}
              placeholder="Search by student name, ID, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Search size={18} color="var(--secondary-text)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Sport Filter */}
          <select
            className="neu-select"
            value={sport}
            onChange={(e) => {
              setSport(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Sports</option>
            {sportsList.map(s => (
              <option key={s._id} value={s.name}>{s.name}</option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            className="neu-select"
            value={batch}
            onChange={(e) => {
              setBatch(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Batches</option>
            {batchesList.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>

          {/* Fee Status Filter */}
          <select
            className="neu-select"
            value={feeStatus}
            onChange={(e) => {
              setFeeStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Fee Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Active / Inactive Status */}
          <select
            className="neu-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active Athletes</option>
            <option value="inactive">Inactive / Alumni</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="neu-card" style={{ padding: 24, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 14px' }}>Athlete ID</th>
              <th style={{ padding: '12px 14px' }}>Athlete Name</th>
              <th style={{ padding: '12px 14px' }}>Sport & Batch</th>
              <th style={{ padding: '12px 14px' }}>Parent / Contact</th>
              <th style={{ padding: '12px 14px' }}>Monthly Fee</th>
              <th style={{ padding: '12px 14px' }}>Fee Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                  Loading athletes...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                  No athletes found matching the selected filters.
                </td>
              </tr>
            ) : (
              students.map(s => {
                let badgeClass = 'badge-success';
                if (s.feeStatus === 'pending') badgeClass = 'badge-warning';
                if (s.feeStatus === 'overdue') badgeClass = 'badge-danger';

                return (
                  <tr
                    key={s._id}
                    style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary-blue)', fontSize: '0.88rem' }}>
                      {s.studentId}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={s.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.studentId}`}
                          alt=""
                          style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF', border: '1px solid #CCD7E7' }}
                        />
                        <div>
                          <div
                            style={{ fontWeight: 700, color: 'var(--dark-text)', cursor: 'pointer' }}
                            onClick={() => navigate(`/students/${s._id}`)}
                          >
                            {s.fullName}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--secondary-text)' }}>
                            {s.gender}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--dark-text)' }}>{s.sport}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)' }}>
                        {s.batch?.name || 'Unassigned'}
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--dark-text)' }}>{s.parentName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)' }}>
                        {s.parentPhone}
                      </div>
                    </td>

                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--dark-text)' }}>
                      ₹{(s.monthlyFee || 0).toLocaleString()}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${badgeClass}`}>
                        {s.feeStatus || 'paid'}
                      </span>
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          title="View Profile & Financials"
                          className="neu-card-flat"
                          style={{ padding: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                          onClick={() => navigate(`/students/${s._id}`)}
                        >
                          <Eye size={17} color="var(--primary-blue)" />
                        </button>

                        {!isCoach && (
                          <>
                            <button
                              title="Collect Payment"
                              className="neu-card-flat"
                              style={{ padding: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                              onClick={() => setPaymentModalStudent(s)}
                            >
                              <CreditCard size={17} color="var(--success)" />
                            </button>

                            <button
                              title="Send WhatsApp Reminder"
                              className="neu-card-flat"
                              style={{ padding: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                              onClick={() => setWaModalStudent(s)}
                            >
                              <MessageSquare size={17} color="#22A477" />
                            </button>

                            <button
                              title="Deactivate Student"
                              className="neu-card-flat"
                              style={{ padding: 6, border: 'none', cursor: 'pointer', background: 'none' }}
                              onClick={() => setStudentToDelete(s)}
                            >
                              <Trash2 size={17} color="var(--danger)" />
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

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={pages}
          totalItems={total}
          itemsPerPage={15}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Modals */}
      <QuickStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStudentAdded={() => fetchStudents()}
      />

      {paymentModalStudent && (
        <QuickPaymentModal
          isOpen={true}
          preselectedStudent={paymentModalStudent}
          onClose={() => setPaymentModalStudent(null)}
          onPaymentRecorded={() => fetchStudents()}
        />
      )}

      {waModalStudent && (
        <WhatsAppReminderModal
          isOpen={true}
          student={waModalStudent}
          dueAmount={waModalStudent.monthlyFee}
          onClose={() => setWaModalStudent(null)}
        />
      )}

      {studentToDelete && (
        <ConfirmationDialog
          isOpen={true}
          title={`Deactivate ${studentToDelete.fullName}?`}
          message={`Are you sure you want to deactivate athlete ID ${studentToDelete.studentId}? All past payment invoices, receipts, and attendance audit logs will be safely preserved for financial integrity.`}
          confirmText="Deactivate"
          isDanger={true}
          onConfirm={handleDeleteConfirm}
          onClose={() => setStudentToDelete(null)}
        />
      )}
    </div>
  );
};

export default Students;
