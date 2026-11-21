const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  parentName: {
    type: String,
    required: [true, 'Parent/Guardian name is required'],
    trim: true
  },
  parentPhone: {
    type: String,
    required: [true, 'Parent phone number is required'],
    trim: true
  },
  emergencyContact: {
    type: String,
    trim: true,
    default: ''
  },
  sport: {
    type: String,
    required: [true, 'Sport is required'],
    trim: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch is required']
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach'
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  monthlyFee: {
    type: Number,
    required: true,
    min: 0,
    default: 2500
  },
  previousOutstandingDues: {
    type: Number,
    default: 0
  },
  medicalNotes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isDemoRecord: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

studentSchema.index({ fullName: 'text', email: 'text', parentPhone: 'text' });
studentSchema.index({ batch: 1 });
studentSchema.index({ sport: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);
