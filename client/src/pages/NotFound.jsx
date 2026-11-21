import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: 20
      }}
    >
      <div
        className="neu-inset"
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}
      >
        <Trophy size={40} color="var(--primary-blue)" />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--dark-text)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--dark-text)', marginTop: 8 }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--secondary-text)', marginTop: 6, maxWidth: 420 }}>
        The sports management view you are looking for does not exist or has been moved.
      </p>

      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: 24 }}
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft size={18} /> Return to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
