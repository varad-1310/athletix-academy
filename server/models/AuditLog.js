const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  entity: {
    type: String,
    required: true,
    enum: ['Student', 'Payment', 'Attendance', 'Batch', 'Coach', 'User', 'Settings', 'FeeInvoice']
  },
  entityId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true // 'CREATE', 'UPDATE', 'DELETE', 'REVERSE', 'MARK_ATTENDANCE'
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  performedByName: {
    type: String,
    default: 'System'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
