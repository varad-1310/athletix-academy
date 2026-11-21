import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Trophy, ShieldCheck, User, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@athletix.com');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Password@123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        className="neu-card"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: 40,
          boxShadow: 'var(--shadow-raised-lg)'
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            className="neu-inset"
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              margin: '0 auto 16px',
              boxShadow: 'var(--shadow-button-primary)'
            }}
          >
            <Trophy size={34} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-text)', letterSpacing: '0.02em' }}>
            ATHLETIX ACADEMY
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--secondary-text)', marginTop: 4 }}>
            Train Smarter. Manage Better. Perform Stronger.
          </p>
        </div>

        {/* 1-Click Demo Accounts Switcher */}
        <div
          className="neu-inset"
          style={{
            padding: 14,
            borderRadius: 'var(--radius-md)',
            marginBottom: 24,
            background: 'rgba(77, 131, 215, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: 8 }}>
            <Sparkles size={14} /> ONE-CLICK DEMO LOGIN (PRE-LOADED)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className={email === 'superadmin@athletix.com' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 8px', fontSize: '0.75rem' }}
              onClick={() => setDemoAccount('superadmin@athletix.com')}
            >
              Super Admin
            </button>
            <button
              type="button"
              className={email === 'admin@athletix.com' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 8px', fontSize: '0.75rem' }}
              onClick={() => setDemoAccount('admin@athletix.com')}
            >
              Academy Admin
            </button>
            <button
              type="button"
              className={email === 'coach.rohit@athletix.com' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 8px', fontSize: '0.75rem' }}
              onClick={() => setDemoAccount('coach.rohit@athletix.com')}
            >
              Coach
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="neu-input"
                style={{ paddingLeft: 42 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@athletix.com"
              />
              <User size={18} color="var(--secondary-text)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="neu-input"
                style={{ paddingLeft: 42 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Lock size={18} color="var(--secondary-text)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px 20px', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.78rem', color: 'var(--secondary-text)' }}>
          Secure JWT Authentication • Role-Based Access Control • Athletix v1.0
        </div>
      </div>
    </div>
  );
};

export default Login;
