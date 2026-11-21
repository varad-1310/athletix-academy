const mongoose = require('mongoose');

const academySettingsSchema = new mongoose.Schema({
  academyName: {
    type: String,
    default: 'ATHLETIX ACADEMY'
  },
  tagline: {
    type: String,
    default: 'Train Smarter. Manage Better. Perform Stronger.'
  },
  logo: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: 'contact@athletixacademy.com'
  },
  phone: {
    type: String,
    default: '+91 98765 43210'
  },
  address: {
    type: String,
    default: 'Plot 42, Olympic Avenue, Sports City, India'
  },
  website: {
    type: String,
    default: 'https://athletixacademy.com'
  },
  academicYear: {
    type: String,
    default: '2026-2027'
  },
  currency: {
    type: String,
    default: '₹'
  },
  supportedSports: [{
    type: String
  }],
  attendanceConfig: {
    lateThresholdMinutes: {
      type: Number,
      default: 15
    },
    autoNotifyAbsence: {
      type: Boolean,
      default: false
    }
  },
  whatsappConfig: {
    enabled: {
      type: Boolean,
      default: true
    },
    template: {
      type: String,
      default: 'Dear {parent_name}, this is a gentle reminder from {academy_name} regarding pending fees of {amount} for {student_name} for {month}. Kindly pay by {due_date}. Thank you!'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AcademySettings', academySettingsSchema);
