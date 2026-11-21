import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import {
  UserCheck,
  Plus,
  Mail,
  Phone,
  Trophy,
  Layers,
  Users,
  Edit,
  Trash2,
  Eye,
  Search,
  Award
} from 'lucide-react';

const Coaches = () => {
  const { isSuperAdmin, isAcademyAdmin } = useAuth();
  const { success, error } = useToast();

  const [coaches, setCoaches] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coachToEdit, setCoachToEdit] = useState(null);
  const [coachToDelete, setCoachToDelete] = useState(null);
  const [selectedCoachProfile, setSelectedCoachProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '5+ Years',
    assignedSports: ['Cricket'],
    salary: 50000
  });

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coaches', { params: { search } });
      if (res.data.success) {
        setCoaches(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const res = await api.get('/sports');
      if (res.data.success) setSports(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [search]);

  const handleOpenCreate = () => {
    setCoachToEdit(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience: '5+ Years',
      assignedSports: [sports[0]?.name || 'Cricket'],
      salary: 50000
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setCoachToEdit(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      specialization: c.specialization,
      experience: c.experience,
      assignedSports: c.assignedSports || [],
      salary: c.salary || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (coachToEdit) {
        const res = await api.put(`/coaches/${coachToEdit._id}`, formData);
        if (res.data.success) {
          success(`Coach "${formData.name}" updated successfully`);
        }
      } else {
        const res = await api.post('/coaches', formData);
        if (res.data.success) {
          success(`Coach "${formData.name}" registered successfully`);
        }
      }
      setIsModalOpen(false);
      fetchCoaches();
    } catch (err) {
      error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!coachToDelete) return;
    try {
      const res = await api.delete(`/coaches/${coachToDelete._id}`);
      if (res.data.success) {
        success(res.data.message);
        fetchCoaches();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete coach');
    } finally {
      setCoachToDelete(null);
    }
  };

  const viewCoachProfile = async (id) => {
    try {
      const res = await api.get(`/coaches/${id}`);
      if (res.data.success) {
        setSelectedCoachProfile(res.data.data);
      }
    } catch (err) {
      error('Failed to load coach details');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Controls */}
      <div className="neu-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-text)' }}>
              Coaching Roster & Staff Management
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--secondary-text)' }}>
              Manage expert instructors, batch assignments and training loads
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-primary" onClick={handleOpenCreate}>
              <Plus size={18} /> Register Coach
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginTop: 18, maxWidth: 400, position: 'relative' }}>
          <input
            type="text"
            className="neu-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search coaches by name, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} color="var(--secondary-text)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Coaches Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: 'var(--secondary-text)' }}>
          Loading coaches...
        </div>
      ) : coaches.length === 0 ? (
        <div className="neu-card" style={{ textAlign: 'center', padding: 40, color: 'var(--secondary-text)' }}>
          No coaches found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {coaches.map(c => (
            <div
              key={c._id}
              className="neu-card"
              style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              {/* Profile Top */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={c.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${c.coachId}`}
                  alt={c.name}
                  style={{ width: 60, height: 60, borderRadius: '50%', background: '#FFF', border: '2px solid #CCD7E7' }}
                />
                <div>
                  <span className="badge badge-info">{c.coachId}</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-text)', marginTop: 4 }}>
                    {c.name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                    {c.specialization}
                  </div>
                </div>
              </div>

              {/* Contact & Experience */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.84rem', color: 'var(--dark-text)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={16} color="var(--primary-blue)" />
                  <span>Experience: <strong>{c.experience}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} color="var(--secondary-text)" />
                  <span>{c.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={16} color="var(--secondary-text)" />
                  <span>{c.phone}</span>
                </div>
              </div>

              {/* Assigned Sports & Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(c.assignedSports || []).map(s => (
                  <span key={s} className="badge badge-success">{s}</span>
                ))}
              </div>

              {/* Student load & Batches count */}
              <div
                className="neu-inset"
                style={{
                  padding: 12,
                  borderRadius: 12,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  textAlign: 'center',
                  gap: 8
                }}
              >
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--secondary-text)', fontWeight: 600 }}>ACTIVE ATHLETES</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-text)' }}>
                    {c.totalStudentsAssigned || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--secondary-text)', fontWeight: 600 }}>BATCHES LED</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                    {c.assignedBatchesList?.length || 0}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(166, 180, 200, 0.4)' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  onClick={() => viewCoachProfile(c._id)}
                >
                  <Eye size={15} /> View Profile
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    title="Edit Coach"
                    className="neu-card-flat"
                    style={{ padding: 8, border: 'none', cursor: 'pointer', background: 'none' }}
                    onClick={() => handleOpenEdit(c)}
                  >
                    <Edit size={16} color="var(--primary-blue)" />
                  </button>

                  <button
                    title="Delete Coach"
                    className="neu-card-flat"
                    style={{ padding: 8, border: 'none', cursor: 'pointer', background: 'none' }}
                    onClick={() => setCoachToDelete(c)}
                  >
                    <Trash2 size={16} color="var(--danger)" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Coach Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={coachToEdit ? `Edit Coach: ${coachToEdit.name}` : 'Register New Coach'}
        subtitle="Instructor credentials, contact information and specializations"
        maxWidth={620}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              className="neu-input"
              placeholder="e.g. Rohit Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                className="neu-input"
                placeholder="coach@athletix.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Phone Number *
              </label>
              <input
                type="tel"
                required
                className="neu-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Specialization / Discipline *
              </label>
              <input
                type="text"
                required
                className="neu-input"
                placeholder="e.g. Elite Batting & High Performance"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Experience (Years) *
              </label>
              <input
                type="text"
                required
                className="neu-input"
                placeholder="e.g. 10+ Years"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Assigned Primary Sport *
              </label>
              <select
                className="neu-select"
                value={formData.assignedSports[0] || 'Cricket'}
                onChange={(e) => setFormData({ ...formData, assignedSports: [e.target.value] })}
              >
                {sports.map(s => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Monthly Salary (₹)
              </label>
              <input
                type="number"
                className="neu-input"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {coachToEdit ? 'Save Changes' : 'Register Coach'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Coach Profile Modal */}
      {selectedCoachProfile && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCoachProfile(null)}
          title={`Coach Profile: ${selectedCoachProfile.name}`}
          subtitle={`${selectedCoachProfile.specialization} • ID: ${selectedCoachProfile.coachId}`}
          maxWidth={650}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img
                src={selectedCoachProfile.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${selectedCoachProfile.coachId}`}
                alt=""
                style={{ width: 70, height: 70, borderRadius: '50%', background: '#FFF', border: '2px solid #CCD7E7' }}
              />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-text)' }}>
                  {selectedCoachProfile.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                  {selectedCoachProfile.email} • {selectedCoachProfile.phone}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', fontWeight: 600, marginTop: 4 }}>
                  Experience: {selectedCoachProfile.experience}
                </div>
              </div>
            </div>

            {/* Assigned Batches */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark-text)', marginBottom: 8 }}>
                Assigned Batches ({selectedCoachProfile.batches?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(selectedCoachProfile.batches || []).map(b => (
                  <span key={b._id} className="badge badge-info">{b.name} ({b.startTime} - {b.endTime})</span>
                ))}
              </div>
            </div>

            {/* Assigned Students */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark-text)', marginBottom: 8 }}>
                Currently Enrolled Athletes ({selectedCoachProfile.students?.length || 0})
              </h4>
              <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(selectedCoachProfile.students || []).map(st => (
                  <div key={st._id} className="neu-card-flat" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                    <strong>{st.fullName}</strong>
                    <span style={{ color: 'var(--secondary-text)' }}>{st.batch?.name || 'Unassigned'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {coachToDelete && (
        <ConfirmationDialog
          isOpen={true}
          title={`Deactivate Coach "${coachToDelete.name}"?`}
          message="Ensure that active batches assigned to this coach are reassigned first."
          confirmText="Deactivate"
          isDanger={true}
          onConfirm={handleDeleteConfirm}
          onClose={() => setCoachToDelete(null)}
        />
      )}
    </div>
  );
};

export default Coaches;
