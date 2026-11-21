const mongoose = require('mongoose');

const feeInvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  month: {
    type: Number, // 1 to 12
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  baseFee: {
    type: Number,
    required: true,
    min: 0
  },
  previousDues: {
    type: Number,
    default: 0
  },
  totalPayable: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'partial', 'unpaid', 'overdue'],
    default: 'unpaid'
  },
  isDemoRecord: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

feeInvoiceSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });
feeInvoiceSchema.index({ status: 1 });
feeInvoiceSchema.index({ dueDate: 1 });

module.exports = mongoose.model('FeeInvoice', feeInvoiceSchema);
