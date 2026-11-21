import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, UserPlus, CreditCard, CalendarCheck, Bell, Database, Sparkles } from 'lucide-react';
import QuickStudentModal from './QuickStudentModal';
import QuickPaymentModal from './QuickPaymentModal';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleMobileSidebar, pageTitle = 'Dashboard' }) => {
  const { user, isCoach } = useAuth();
  const navigate = useNavigate();
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  return (
    <>
      <header
        className="app-navbar"
        style={{
          height: 72,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
          backgroundColor: 'var(--bg-color)',
          position: 'sticky',
          top: 0,
          zIndex: 80,
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Left: Mobile menu & Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onToggleMobileSidebar}
            className="neu-card-flat"
            style={{
              display: 'none',
              padding: 8,
              border: 'none',
              cursor: 'pointer',
              background: 'none'
            }}
            id="mobile-menu-btn"
          >
            <Menu size={22} color="var(--dark-text)" />
          </button>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-text)' }}>
              {pageTitle}
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--secondary-text)' }}>
              Train Smarter. Manage Better. Perform Stronger.
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Demo Data Pill */}
          <div
            className="neu-inset"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--primary-blue)',
              background: 'rgba(77, 131, 215, 0.1)'
            }}
            title="Database populated with 120 students, 8 coaches, 10 batches & 3 months of records"
          >
            <Database size={14} />
            <span>DEMO DATA ACTIVE</span>
          </div>

          {/* Quick Actions (Admins only) */}
          {!isCoach && (
            <>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={() => setIsStudentModalOpen(true)}
              >
                <UserPlus size={16} /> Add Student
              </button>

              <button
                type="button"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <CreditCard size={16} /> Collect Fees
              </button>
            </>
          )}

          {/* Coach Quick Action */}
          {isCoach && (
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => navigate('/attendance')}
            >
              <CalendarCheck size={16} /> Mark Attendance
            </button>
          )}
        </div>
      </header>

      {/* Global Quick Modals */}
      <QuickStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onStudentAdded={() => {
          // Fire custom event to refresh tables
          window.dispatchEvent(new Event('athletix_data_updated'));
        }}
      />

      <QuickPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentRecorded={() => {
          window.dispatchEvent(new Event('athletix_data_updated'));
        }}
      />
    </>
  );
};

export default Navbar;
