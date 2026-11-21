import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as XLSX from 'xlsx';
import {
  CalendarCheck,
  Calendar,
  Layers,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Download,
  CheckSquare,
  FileText,
  AlertCircle
} from 'lucide-react';

const Attendance = () => {
  const { user, isCoach } = useAuth();
  const { success, error } = useToast();

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: { status: 'present'|'absent'|'late', remark: '' } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [auditReason, setAuditReason] = useState('');
  const [isExistingRecord, setIsExistingRecord] = useState(false);

  // Tab: 'sheet' | 'history'
  const [activeTab, setActiveTab] = useState('sheet');
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyMonth, setHistoryMonth] = useState(new Date().getMonth() + 1);
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await api.get('/batches');
      if (res.data.success && res.data.data.length > 0) {
        setBatches(res.data.data);
        setSelectedBatch(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedBatch && selectedDate && activeTab === 'sheet') {
      loadBatchStudentsAndAttendance();
    }
  }, [selectedBatch, selectedDate, activeTab]);

  useEffect(() => {
    if (activeTab === 'history' && selectedBatch) {
      loadAttendanceHistory();
    }
  }, [activeTab, selectedBatch, historyMonth, historyYear]);

  const loadBatchStudentsAndAttendance = async () => {
    try {
      setLoading(true);
      // 1. Load enrolled students for selected batch
      const bRes = await api.get(`/batches/${selectedBatch}`);
      const enrolled = bRes.data.data.students || [];
      setStudents(enrolled);

      // 2. Check if attendance document exists for this batch & date
      const attRes = await api.get('/attendance', {
        params: { batchId: selectedBatch, date: selectedDate }
      });

      const map = {};
      if (attRes.data.success && attRes.data.data.length > 0) {
        setIsExistingRecord(true);
        const existingDoc = attRes.data.data[0];
        existingDoc.records.forEach(r => {
          const sId = r.student?._id || r.student;
          map[sId] = { status: r.status, remark: r.remark || '' };
        });
      } else {
        setIsExistingRecord(false);
        // Default all enrolled athletes to present
        enrolled.forEach(s => {
          map[s._id] = { status: 'present', remark: '' };
        });
      }
      setAttendanceMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance', {
        params: { batchId: selectedBatch, month: historyMonth, year: historyYear }
      });
      if (res.data.success) {
        setHistoryRecords(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const setRemark = (studentId, remark) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remark }
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s._id] = { ...attendanceMap[s._id], status };
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        student: s._id,
        status: attendanceMap[s._id]?.status || 'present',
        remark: attendanceMap[s._id]?.remark || ''
      }));

      const res = await api.post('/attendance', {
        batchId: selectedBatch,
        date: selectedDate,
        records,
        reason: auditReason || (isExistingRecord ? 'Daily attendance modification' : 'Initial marking')
      });

      if (res.data.success) {
        success(res.data.message || 'Attendance saved successfully!');
        setIsExistingRecord(true);
        setAuditReason('');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Export attendance history to CSV
  const handleExportAttendance = () => {
    if (historyRecords.length === 0) {
      return error('No attendance history available to export');
    }

    const rows = [];
    historyRecords.forEach(doc => {
      const dateStr = new Date(doc.date).toLocaleDateString('en-GB');
      doc.records.forEach(r => {
        rows.push({
          'Date': dateStr,
          'Sport': doc.sport,
          'Batch': doc.batch?.name || '',
          'Athlete ID': r.student?.studentId || '',
          'Athlete Name': r.student?.fullName || '',
          'Attendance Status': r.status?.toUpperCase(),
          'Remark': r.remark || ''
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance_Report');
    XLSX.writeFile(wb, `Attendance_Batch_${selectedDate}.xlsx`);
    success(`Exported ${rows.length} session attendance records!`);
  };

  const currentBatchObj = batches.find(b => b._id === selectedBatch);

  // Stats for the active sheet
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  students.forEach(s => {
    const st = attendanceMap[s._id]?.status;
    if (st === 'present') presentCount++;
    else if (st === 'absent') absentCount++;
    else if (st === 'late') lateCount++;
  });
  const sheetPct = students.length > 0 ? Math.round(((presentCount + (lateCount * 0.5)) / students.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header Card */}
      <div className="neu-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-text)' }}>
              Daily Attendance Management
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--secondary-text)' }}>
              Accurate session tracking, duplicate prevention and attendance percentage audits
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className={activeTab === 'sheet' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveTab('sheet')}
            >
              <CalendarCheck size={16} /> Mark Attendance Sheet
            </button>
            <button
              type="button"
              className={activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveTab('history')}
            >
              <FileText size={16} /> Attendance Logs & Reports
            </button>
          </div>
        </div>

        {/* Selection Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20 }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Select Training Batch *
            </label>
            <select
              className="neu-select"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              {batches.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.sport}) • {b.startTime} - {b.endTime}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'sheet' ? (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Session Date *
              </label>
              <input
                type="date"
                className="neu-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                  Report Month *
                </label>
                <select
                  className="neu-select"
                  value={historyMonth}
                  onChange={(e) => setHistoryMonth(Number(e.target.value))}
                >
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                  Report Year *
                </label>
                <input
                  type="number"
                  className="neu-input"
                  value={historyYear}
                  onChange={(e) => setHistoryYear(Number(e.target.value))}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tab 1: Attendance Marking Sheet */}
      {activeTab === 'sheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary KPIs & Bulk Actions Bar */}
          <div
            className="neu-card"
            style={{
              padding: '16px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', fontWeight: 600 }}>ATTENDANCE RATE</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-blue)' }}>{sheetPct}%</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', fontWeight: 600 }}>PRESENT</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{presentCount}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', fontWeight: 600 }}>ABSENT</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>{absentCount}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', fontWeight: 600 }}>LATE</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)' }}>{lateCount}</div>
              </div>
            </div>

            {/* Bulk Marking Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                onClick={() => markAll('present')}
              >
                <CheckSquare size={16} color="var(--success)" /> Mark All Present
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                onClick={() => markAll('absent')}
              >
                <XCircle size={16} color="var(--danger)" /> Mark All Absent
              </button>
            </div>
          </div>

          {/* Existing Attendance Status Banner */}
          {isExistingRecord && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: 'rgba(77, 131, 215, 0.12)', borderRadius: 12, border: '1px solid rgba(77, 131, 215, 0.3)', color: 'var(--dark-text)', fontSize: '0.88rem' }}>
              <AlertCircle size={20} color="var(--primary-blue)" />
              <span>Attendance has already been recorded for this batch on <strong>{selectedDate}</strong>. Any changes will be audited and saved with a version timestamp.</span>
            </div>
          )}

          {/* Students List Table */}
          <div className="neu-card" style={{ padding: 24, overflowX: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                Loading enrolled athletes...
              </div>
            ) : students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                No active students enrolled in this batch.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px' }}>Athlete ID</th>
                    <th style={{ padding: '12px 14px' }}>Athlete Name</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Mark Status</th>
                    <th style={{ padding: '12px 14px' }}>Remark / Delay Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const currentStatus = attendanceMap[s._id]?.status || 'present';
                    const currentRemark = attendanceMap[s._id]?.remark || '';

                    return (
                      <tr key={s._id} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                        <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary-blue)', fontSize: '0.88rem' }}>
                          {s.studentId}
                        </td>

                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={s.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.studentId}`}
                              alt=""
                              style={{ width: 34, height: 34, borderRadius: '50%', background: '#FFF' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--dark-text)' }}>{s.fullName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Parent: {s.parentPhone}</div>
                            </div>
                          </div>
                        </td>

                        {/* Status Buttons: Present | Absent | Late */}
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <button
                              type="button"
                              className={currentStatus === 'present' ? 'btn-primary' : 'btn-secondary'}
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                background: currentStatus === 'present' ? 'linear-gradient(135deg, #22A477 0%, #15803D 100%)' : undefined,
                                color: currentStatus === 'present' ? '#FFF' : undefined
                              }}
                              onClick={() => setStatus(s._id, 'present')}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              className={currentStatus === 'late' ? 'btn-primary' : 'btn-secondary'}
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                background: currentStatus === 'late' ? 'linear-gradient(135deg, #E5A23A 0%, #B45309 100%)' : undefined,
                                color: currentStatus === 'late' ? '#FFF' : undefined
                              }}
                              onClick={() => setStatus(s._id, 'late')}
                            >
                              Late
                            </button>

                            <button
                              type="button"
                              className={currentStatus === 'absent' ? 'btn-primary' : 'btn-secondary'}
                              style={{
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                background: currentStatus === 'absent' ? 'linear-gradient(135deg, #DE5965 0%, #B91C1C 100%)' : undefined,
                                color: currentStatus === 'absent' ? '#FFF' : undefined
                              }}
                              onClick={() => setStatus(s._id, 'absent')}
                            >
                              Absent
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: '14px' }}>
                          <input
                            type="text"
                            className="neu-input"
                            style={{ padding: '6px 12px', fontSize: '0.84rem' }}
                            placeholder="Optional note e.g. 10m traffic delay"
                            value={currentRemark}
                            onChange={(e) => setRemark(s._id, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Save Attendance Bar */}
            {students.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(166, 180, 200, 0.4)', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <input
                    type="text"
                    className="neu-input"
                    placeholder="Audit reason (required if editing previous attendance)..."
                    value={auditReason}
                    onChange={(e) => setAuditReason(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                  onClick={handleSaveAttendance}
                  disabled={saving || loading}
                >
                  <Save size={18} /> {saving ? 'Saving...' : (isExistingRecord ? 'Update Attendance Record' : 'Save Session Attendance')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Logs & Reports */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="neu-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-text)' }}>
                  Monthly Attendance Sessions ({historyRecords.length} Sessions)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--secondary-text)' }}>
                  Detailed historical ledger for {currentBatchObj?.name}
                </p>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleExportAttendance}
              >
                <Download size={16} /> Export Attendance Report (.xlsx)
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                Loading session logs...
              </div>
            ) : historyRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
                No attendance sessions found for the selected month/year.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {historyRecords.map(doc => {
                  let p = 0;
                  let a = 0;
                  let l = 0;
                  doc.records.forEach(r => {
                    if (r.status === 'present') p++;
                    else if (r.status === 'absent') a++;
                    else if (r.status === 'late') l++;
                  });
                  const rate = doc.records.length > 0 ? Math.round(((p + (l * 0.5)) / doc.records.length) * 100) : 0;

                  return (
                    <div key={doc._id} className="neu-card-flat" style={{ padding: 18 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--dark-text)', fontSize: '1rem' }}>
                            {new Date(doc.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)', marginTop: 2 }}>
                            Logged by {doc.markedBy?.name || 'Staff'} • {doc.records.length} Athletes Recorded
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span className="badge badge-success">{p} Present</span>
                          <span className="badge badge-danger">{a} Absent</span>
                          <span className="badge badge-warning">{l} Late</span>
                          <div style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '1.1rem' }}>
                            {rate}% Turnout
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
