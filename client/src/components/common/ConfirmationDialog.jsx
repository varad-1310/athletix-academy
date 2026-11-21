import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={450}>
      <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
        <div
          className="neu-inset"
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDanger ? 'rgba(222, 89, 101, 0.15)' : 'rgba(229, 162, 58, 0.15)'
          }}
        >
          <AlertTriangle size={28} color={isDanger ? 'var(--danger)' : 'var(--warning)'} />
        </div>
        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark-text)', marginBottom: 8 }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.92rem', color: 'var(--secondary-text)', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={isDanger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
