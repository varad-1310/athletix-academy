import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import {
  Settings as SettingsIcon,
  ShieldAlert,
  Building,
  Lock,
  RotateCcw,
  Save,
  Users,
  Trophy,
  CheckCircle2,
  Database
} from 'lucide-react';

const Settings = () => {
  const { user, isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('academy'); // 'academy' | 'security' | 'users' | 'demo'
  const [loading, setLoading] = useState(false);

  // Academy Form
  const [academyName, setAcademyName] = useState('ATHLETIX ACADEMY');
  const [tagline, setTagline] = useState('Train Smarter. Manage Better. Perform Stronger.');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('contact@athletixacademy.com');
  const [address, setAddress] = useState('Plot 42, Olympic Avenue, Sports City, India');
  const [academicYear, setAcademicYear] = useState('2026-2027');

  // Password update form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Demo reset
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Users list (Super Admin)
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    fetchSettings();
    if (isSuperAdmin) fetchUsers();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.data);
        setAcademyName(res.data.data.academyName);
        setTagline(res.data.data.tagline);
        setPhone(res.data.data.phone);
        setEmail(res.data.data.email);
        setAddress(res.data.data.address);
        setAcademicYear(res.data.data.academicYear);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAcademy = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/settings', {
        academyName,
        tagline,
        phone,
        email,
        address,
        academicYear
      });
      if (res.data.success) {
        success('Academy profile settings updated successfully!');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return error('New password and confirm password do not match');
    }
    if (newPassword.length < 6) {
      return error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await api.put('/auth/update-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemoConfirm = async () => {
    if (resetConfirmInput !== 'RESET_DEMO_DATA') {
      return error('Please type "RESET_DEMO_DATA" exactly to confirm reset.');
    }

    setResetting(true);
    try {
      const res = await api.post('/demo/reset', {
        confirmation: 'RESET_DEMO_DATA'
      });
      if (res.data.success) {
        success('Demo database reset and re-seeded with 120 athletes, 8 coaches and 10 batches!');
        setIsResetConfirmOpen(false);
        setResetConfirmInput('');
        window.dispatchEvent(new Event('athletix_data_updated'));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reset demo data');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Settings Navigation Tabs */}
      <div className="neu-card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button
          type="button"
          className={activeTab === 'academy' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('academy')}
        >
          <Building size={16} /> Academy Profile
        </button>

        <button
          type="button"
          className={activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={16} /> Security & Password
        </button>

        {isSuperAdmin && (
          <button
            type="button"
            className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} /> User Management ({usersList.length})
          </button>
        )}

        <button
          type="button"
          className={activeTab === 'demo' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('demo')}
        >
          <Database size={16} /> Demo Data & System Reset
        </button>
      </div>

      {/* Tab 1: Academy Profile */}
      {activeTab === 'academy' && (
        <div className="neu-card" style={{ padding: 28, maxWidth: 750 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 20 }}>
            Academy Branding & Contact Details
          </h3>

          <form onSubmit={handleSaveAcademy} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                  Academy Name
                </label>
                <input
                  type="text"
                  required
                  className="neu-input"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                  Academic Term / Year
                </label>
                <input
                  type="text"
                  required
                  className="neu-input"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Brand Tagline
              </label>
              <input
                type="text"
                className="neu-input"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  className="neu-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                  Official Phone
                </label>
                <input
                  type="tel"
                  required
                  className="neu-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Physical Address
              </label>
              <input
                type="text"
                className="neu-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="neu-card" style={{ padding: 28, maxWidth: 550 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 20 }}>
            Change Password
          </h3>

          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Current Password *
              </label>
              <input
                type="password"
                required
                className="neu-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                New Password *
              </label>
              <input
                type="password"
                required
                className="neu-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 4 }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                className="neu-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                <Save size={18} /> Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Users List (Super Admin only) */}
      {activeTab === 'users' && isSuperAdmin && (
        <div className="neu-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-text)', marginBottom: 16 }}>
            System Users & RBAC Roles
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(166, 180, 200, 0.4)', color: 'var(--secondary-text)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Name</th>
                  <th style={{ padding: '10px 12px' }}>Email</th>
                  <th style={{ padding: '10px 12px' }}>Role</th>
                  <th style={{ padding: '10px 12px' }}>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(166, 180, 200, 0.25)' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-info">{u.role?.replace('_', ' ')}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-success">{u.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Demo Data Reset */}
      {activeTab === 'demo' && (
        <div className="neu-card" style={{ padding: 28, maxWidth: 650 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="neu-inset" style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={22} color="var(--primary-blue)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-text)' }}>
                Demo Data & Reset Utility
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--secondary-text)' }}>
                Safely wipe test records and re-seed 120 realistic athletes, 8 coaches and 10 batches.
              </p>
            </div>
          </div>

          <div
            className="neu-inset"
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(229, 162, 58, 0.1)',
              border: '1px solid rgba(229, 162, 58, 0.3)',
              marginBottom: 20
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--dark-text)', fontSize: '0.9rem', marginBottom: 4 }}>
              Demonstration Environment Active
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', lineHeight: 1.5 }}>
              Resetting will restore the full mock academy database with 120 students, 8 coaches, 10 batches, and 3 months of generated attendance sessions & fee payments.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)' }}>
              To confirm reset, type <strong style={{ color: 'var(--danger)' }}>RESET_DEMO_DATA</strong> below:
            </label>
            <input
              type="text"
              className="neu-input"
              placeholder="RESET_DEMO_DATA"
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
            />

            <button
              type="button"
              className="btn-danger"
              style={{ padding: '12px 20px', justifyContent: 'center', marginTop: 8 }}
              disabled={resetConfirmInput !== 'RESET_DEMO_DATA' || resetting}
              onClick={handleResetDemoConfirm}
            >
              <RotateCcw size={18} /> {resetting ? 'Resetting & Seeding Database...' : 'Confirm Demo Data Reset'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
