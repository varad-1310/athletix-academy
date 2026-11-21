const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true,
    default: 'present'
  },
  remark: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const auditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  modifierName: { type: String, default: '' },
  reason: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  sport: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  records: [attendanceRecordSchema],
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  auditLog: [auditSchema]
}, {
  timestamps: true
});

// Ensure only one attendance document per batch per calendar day
attendanceSchema.index({ batch: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
