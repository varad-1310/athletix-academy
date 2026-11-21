import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UserPlus, AlertCircle } from 'lucide-react';

const QuickStudentModal = ({ isOpen, onClose, onStudentAdded }) => {
  const { success, error } = useToast();
  const [batches, setBatches] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dob: '2012-05-15',
    phone: '',
    email: '',
    parentName: '',
    parentPhone: '',
    sport: '',
    batch: '',
    monthlyFee: '',
    previousOutstandingDues: 0,
    medicalNotes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadBatchesAndSports();
    }
  }, [isOpen]);

  const loadBatchesAndSports = async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        api.get('/batches'),
        api.get('/sports')
      ]);
      if (bRes.data.success) {
        setBatches(bRes.data.data);
        if (bRes.data.data.length > 0 && !formData.batch) {
          const firstBatch = bRes.data.data[0];
          setFormData(prev => ({
            ...prev,
            batch: firstBatch._id,
            sport: firstBatch.sport,
            monthlyFee: firstBatch.monthlyFee
          }));
        }
      }
      if (sRes.data.success) setSports(sRes.data.data);
    } catch (err) {
      console.error('Failed to load batches/sports', err);
    }
  };

  const handleBatchChange = (batchId) => {
    const selected = batches.find(b => b._id === batchId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        batch: batchId,
        sport: selected.sport,
        monthlyFee: selected.monthlyFee
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        success(`Student ${res.data.data.fullName} registered successfully with ID: ${res.data.data.studentId}`);
        if (onStudentAdded) onStudentAdded(res.data.data);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  const selectedBatch = batches.find(b => b._id === formData.batch);
  const isBatchFull = selectedBatch?.isFull;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Student" subtitle="Create athlete profile and assign training batch" maxWidth={700}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isBatchFull && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(222, 89, 101, 0.15)', borderRadius: 10, color: 'var(--danger)', fontSize: '0.88rem' }}>
            <AlertCircle size={18} />
            <span>Warning: Selected batch is at full capacity ({selectedBatch.maxCapacity} students). Enrollment will be blocked.</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              className="neu-input"
              placeholder="e.g. Aarav Sharma"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Gender *
            </label>
            <select
              className="neu-select"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Date of Birth *
            </label>
            <input
              type="date"
              required
              className="neu-input"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Student Email (Optional)
            </label>
            <input
              type="email"
              className="neu-input"
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Parent / Guardian Name *
            </label>
            <input
              type="text"
              required
              className="neu-input"
              placeholder="e.g. Mr. Rajesh Sharma"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Parent Phone *
            </label>
            <input
              type="tel"
              required
              className="neu-input"
              placeholder="+91 98765 43210"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Assign Batch & Sport *
            </label>
            <select
              required
              className="neu-select"
              value={formData.batch}
              onChange={(e) => handleBatchChange(e.target.value)}
            >
              {batches.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.sport}) - {b.enrolledCount || 0}/{b.maxCapacity} slots
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Monthly Fee (₹) *
            </label>
            <input
              type="number"
              required
              className="neu-input"
              value={formData.monthlyFee}
              onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Previous Outstanding Balance (₹)
            </label>
            <input
              type="number"
              className="neu-input"
              value={formData.previousOutstandingDues}
              onChange={(e) => setFormData({ ...formData, previousOutstandingDues: Number(e.target.value) })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Medical Notes / Restrictions
            </label>
            <input
              type="text"
              className="neu-input"
              placeholder="e.g. Asthma, Knee surgery"
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading || isBatchFull}>
            <UserPlus size={18} /> {loading ? 'Registering...' : 'Register Athlete'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickStudentModal;
