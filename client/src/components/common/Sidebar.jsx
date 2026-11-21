import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Layers,
  UserCheck,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, isCoach, isSuperAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Batches', path: '/batches', icon: Layers },
    { name: 'Coaches', path: '/coaches', icon: UserCheck, hideFor: ['coach'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'Fees & Payments', path: '/payments', icon: CreditCard, hideFor: ['coach'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, hideFor: ['coach'] },
    { name: 'Settings', path: '/settings', icon: Settings, hideFor: ['coach'] }
  ];

  const visibleItems = navItems.filter(item => !item.hideFor || !item.hideFor.includes(user?.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(53, 68, 95, 0.5)',
            zIndex: 90,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside
        className={`app-sidebar neu-card ${isMobileOpen ? 'open' : ''}`}
        style={{
          width: 270,
          minHeight: '100vh',
          backgroundColor: 'var(--card-bg)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          zIndex: 100,
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRadius: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.6)'
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.6)' }}>
          <div
            className="neu-inset"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: 'var(--shadow-button-primary)'
            }}
          >
            <Trophy size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-text)', letterSpacing: '0.04em' }}>
              ATHLETIX
            </h1>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-blue)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ACADEMY
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24, overflowY: 'auto' }}>
          {visibleItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  transition: 'var(--transition)',
                  color: isActive ? 'var(--primary-blue)' : 'var(--dark-text)',
                  backgroundColor: isActive ? 'var(--bg-color)' : 'transparent',
                  boxShadow: isActive ? 'var(--shadow-inset)' : 'none',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid transparent'
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} color={isActive ? 'var(--primary-blue)' : 'var(--secondary-text)'} />
                    <span style={{ flex: 1 }}>{item.name}</span>
                    {isActive && <ChevronRight size={16} color="var(--primary-blue)" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div
          className="neu-card-flat"
          style={{
            marginTop: 'auto',
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${user?.email || 'User'}`}
              alt="Avatar"
              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #FFF' }}
            />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--dark-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.72rem', textTransform: 'capitalize', color: 'var(--primary-blue)', fontWeight: 600 }}>
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              color: 'var(--secondary-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--secondary-text)'}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
