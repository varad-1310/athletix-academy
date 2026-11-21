import React, { useState } from 'react';
import Modal from './Modal';
import { Send, MessageSquare, ExternalLink } from 'lucide-react';

const WhatsAppReminderModal = ({ isOpen, onClose, student, dueAmount, dueDate }) => {
  if (!student) return null;

  const parentPhone = student.parentPhone ? student.parentPhone.replace(/[^0-9]/g, '') : '';
  const initialMessage = `Dear ${student.parentName || 'Parent'}, this is a gentle reminder from ATHLETIX ACADEMY regarding pending fee dues of ₹${(dueAmount || student.monthlyFee || 0).toLocaleString()} for ${student.fullName}. Kindly clear the dues by ${dueDate || '10th of this month'}. For any assistance, feel free to contact us. Train Smarter, Perform Stronger!`;

  const [message, setMessage] = useState(initialMessage);

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const waUrl = parentPhone ? `https://wa.me/${parentPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Fee Reminder via WhatsApp" maxWidth={560}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(34, 164, 119, 0.1)', borderRadius: 12, border: '1px solid rgba(34, 164, 119, 0.2)' }}>
          <MessageSquare size={24} color="#22A477" />
          <div style={{ fontSize: '0.85rem', color: 'var(--dark-text)' }}>
            Athletix Academy adheres strictly to user privacy: <strong>Messages are never sent automatically without authorization.</strong> You can review, edit the message below, and manually confirm before opening WhatsApp.
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 6 }}>
            Recipient Phone (Parent):
          </label>
          <input
            type="text"
            className="neu-input"
            value={student.parentPhone || ''}
            disabled
            style={{ fontWeight: 600 }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)', display: 'block', marginBottom: 6 }}>
            Reminder Message:
          </label>
          <textarea
            className="neu-textarea"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '4px 4px 10px rgba(37, 211, 102, 0.3)' }}
            onClick={handleSendWhatsApp}
          >
            <ExternalLink size={18} /> Open in WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppReminderModal;
