import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import {
  Layers,
  Plus,
  Clock,
  Calendar,
  Users,
  UserCheck,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  Search
} from 'lucide-react';

const Batches = () => {
  const { isCoach } = useAuth();
  const { success, error } = useToast();

  const [batches, setBatches] = useState([]);
  const [sports, setSports] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState(null);
  const [batchEnrolledModal, setBatchEnrolledModal] = useState(null);
  const [batchToDelete, setBatchToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sport: 'Cricket',
    coach: '',
    trainingDays: ['Monday', 'Wednesday', 'Friday'],
    startTime: '06:30 AM',
    endTime: '08:00 AM',
    maxCapacity: 20,
    monthlyFee: 2500
  });

  const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/batches', {
        params: { search, sport: sportFilter }
      });
      if (res.data.success) {
        setBatches(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/sports'),
        api.get('/coaches')
      ]);
      if (sRes.data.success) setSports(sRes.data.data);
      if (cRes.data.success) {
        setCoaches(cRes.data.data);
        if (cRes.data.data.length > 0 && !formData.coach) {
          setFormData(prev => ({ ...prev, coach: cRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [search, sportFilter]);

  const handleOpenCreate = () => {
    setBatchToEdit(null);
    setFormData({
      name: '',
      sport: sports[0]?.name || 'Cricket',
      coach: coaches[0]?._id || '',
      trainingDays: ['Monday', 'Wednesday', 'Friday'],
      startTime: '06:30 AM',
      endTime: '08:00 AM',
      maxCapacity: 20,
      monthlyFee: 2500
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setBatchToEdit(b);
    setFormData({
      name: b.name,
      sport: b.sport,
      coach: b.coach?._id || b.coach,
      trainingDays: b.trainingDays || [],
      startTime: b.startTime,
      endTime: b.endTime,
      maxCapacity: b.maxCapacity,
      monthlyFee: b.monthlyFee
    });
    setIsCreateModalOpen(true);
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      const exists = prev.trainingDays.includes(day);
      const updated = exists ? prev.trainingDays.filter(d => d !== day) : [...prev.trainingDays, day];
      return { ...prev, trainingDays: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (batchToEdit) {
        const res = await api.put(`/batches/${batchToEdit._id}`, formData);
        if (res.data.success) {
          success(`Batch "${formData.name}" updated successfully`);
        }
      } else {
        const res = await api.post('/batches', formData);
        if (res.data.success) {
          success(`Batch "${formData.name}" created successfully`);
        }
      }
      setIsCreateModalOpen(false);
      fetchBatches();
    } catch (err) {
      error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!batchToDelete) return;
    try {
      const res = await api.delete(`/batches/${batchToDelete._id}`);
      if (res.data.success) {
        success(res.data.message);
        fetchBatches();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete batch');
    } finally {
      setBatchToDelete(null);
    }
  };

  const viewEnrolledStudents = async (batchId) => {
    try {
      const res = await api.get(`/batches/${batchId}`);
      if (res.data.success) {
        setBatchEnrolledModal(res.data.data);
      }
    } catch (err) {
      error('Failed to load batch details');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Controls Header */}
      <div className="neu-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-text)' }}>
              Training Batches & Capacity Management
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--secondary-text)' }}>
              Manage sports schedules, capacities, coaching rosters and student enrollments
            </p>
          </div>

          {!isCoach && (
            <button type="button" className="btn-primary" onClick={handleOpenCreate}>
              <Plus size={18} /> Create New Batch
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 18 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="neu-input"
              style={{ paddingLeft: 38 }}
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} color="var(--secondary-text)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <select
            className="neu-select"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          >
            <option value="all">All Sports</option>
            {sports.map(s => (
              <option key={s._id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: 'var(--secondary-text)' }}>
          Loading batches...
        </div>
      ) : batches.length === 0 ? (
        <div className="neu-card" style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
          No batches found. Click "Create New Batch" to add one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {batches.map(b => {
            const enrolled = b.enrolledCount || 0;
            const capacity = b.maxCapacity || 20;
            const pct = Math.min(100, Math.round((enrolled / capacity) * 100));
            const isFull = pct >= 100;

            return (
              <div
                key={b._id}
                className="neu-card"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  borderTop: isFull ? '4px solid var(--danger)' : '4px solid var(--primary-blue)'
                }}
              >
                {/* Batch Title & Sport */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-info">{b.sport}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-text)', marginTop: 6 }}>
                      {b.name}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                      ₹{b.monthlyFee?.toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>per month</span>
                  </div>
                </div>

                {/* Schedule & Coach Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.86rem', color: 'var(--dark-text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} color="var(--primary-blue)" />
                    <span>{b.startTime} – {b.endTime}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={16} color="var(--primary-blue)" />
                    <span>{(b.trainingDays || []).join(', ')}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserCheck size={16} color="var(--success)" />
                    <span>Coach: <strong>{b.coach?.name || 'Assigned Staff'}</strong></span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div style={{ marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: 'var(--secondary-text)' }}>Capacity Utilization</span>
                    <span style={{ fontWeight: 700, color: isFull ? 'var(--danger)' : 'var(--dark-text)' }}>
                      {enrolled} / {capacity} ({pct}%)
                    </span>
                  </div>
                  <div
                    className="neu-inset"
                    style={{
                      height: 10,
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      padding: 2
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 'var(--radius-full)',
                        width: `${pct}%`,
                        background: isFull ? 'var(--danger)' : (pct > 75 ? 'var(--warning)' : 'var(--primary-gradient)'),
                        transition: 'width 0.4s ease-out'
                      }}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(166, 180, 200, 0.4)' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                    onClick={() => viewEnrolledStudents(b._id)}
                  >
                    <Users size={15} /> View Students ({enrolled})
                  </button>

                  {!isCoach && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        title="Edit Batch"
                        className="neu-card-flat"
                        style={{ padding: 8, border: 'none', cursor: 'pointer', background: 'none' }}
                        onClick={() => handleOpenEdit(b)}
                      >
                        <Edit size={16} color="var(--primary-blue)" />
                      </button>

                      <button
                        title="Delete Batch"
                        className="neu-card-flat"
                        style={{ padding: 8, border: 'none', cursor: 'pointer', background: 'none' }}
                        onClick={() => setBatchToDelete(b)}
                      >
                        <Trash2 size={16} color="var(--danger)" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Batch Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={batchToEdit ? `Edit Batch: ${batchToEdit.name}` : 'Create New Training Batch'}
        subtitle="Configure sport, schedule, coach and capacity constraints"
        maxWidth={620}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Batch Name *
            </label>
            <input
              type="text"
              required
              className="neu-input"
              placeholder="e.g. Cricket Morning Colts"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Sport Discipline *
              </label>
              <select
                className="neu-select"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              >
                {sports.map(s => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Lead Coach *
              </label>
              <select
                className="neu-select"
                value={formData.coach}
                onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
              >
                {coaches.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.specialization})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Training Days Selector */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 6 }}>
              Training Days *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_DAYS.map(day => {
                const isSelected = formData.trainingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    className={isSelected ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Start Time *
              </label>
              <input
                type="text"
                required
                className="neu-input"
                placeholder="e.g. 06:30 AM"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                End Time *
              </label>
              <input
                type="text"
                required
                className="neu-input"
                placeholder="e.g. 08:00 AM"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Max Capacity (Enforcement) *
              </label>
              <input
                type="number"
                required
                min="1"
                className="neu-input"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Monthly Fee (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="neu-input"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {batchToEdit ? 'Save Changes' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enrolled Students Modal */}
      {batchEnrolledModal && (
        <Modal
          isOpen={true}
          onClose={() => setBatchEnrolledModal(null)}
          title={`Enrolled Athletes: ${batchEnrolledModal.name}`}
          subtitle={`${batchEnrolledModal.students?.length || 0} of ${batchEnrolledModal.maxCapacity} slots filled`}
          maxWidth={650}
        >
          {batchEnrolledModal.students?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--secondary-text)' }}>
              No athletes currently enrolled in this batch.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
              {batchEnrolledModal.students.map(s => (
                <div
                  key={s._id}
                  className="neu-card-flat"
                  style={{
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={s.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.studentId}`}
                      alt=""
                      style={{ width: 34, height: 34, borderRadius: '50%', background: '#FFF' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--dark-text)', fontSize: '0.92rem' }}>
                        {s.fullName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                        ID: {s.studentId} • Parent: {s.parentPhone}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-success">Enrolled</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirmation */}
      {batchToDelete && (
        <ConfirmationDialog
          isOpen={true}
          title={`Delete Batch "${batchToDelete.name}"?`}
          message="Batches with active students cannot be deleted. Are you sure you want to proceed?"
          confirmText="Delete"
          isDanger={true}
          onConfirm={handleDeleteConfirm}
          onClose={() => setBatchToDelete(null)}
        />
      )}
    </div>
  );
};

export default Batches;
