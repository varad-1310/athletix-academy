const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeInvoice'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Payment amount must be greater than 0']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'card'],
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  feeMonth: {
    type: Number,
    required: true
  },
  feeYear: {
    type: Number,
    required: true
  },
  previousBalance: {
    type: Number,
    required: true
  },
  remainingBalance: {
    type: Number,
    required: true
  },
  transactionReference: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['success', 'reversed'],
    default: 'success'
  },
  reversedAt: {
    type: Date,
    default: null
  },
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reversalReason: {
    type: String,
    default: ''
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDemoRecord: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

paymentSchema.index({ student: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
