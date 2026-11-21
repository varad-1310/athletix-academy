const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true
  },
  sport: {
    type: String,
    required: [true, 'Sport is required'],
    trim: true
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: [true, 'Coach is required']
  },
  trainingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  startTime: {
    type: String,
    required: [true, 'Start time is required'] // e.g. "06:30 AM" or "16:00"
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1'],
    default: 20
  },
  monthlyFee: {
    type: Number,
    required: true,
    min: 0,
    default: 2500
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Batch', batchSchema);
