const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentType: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  pgName: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
  monthlyFee: {
    type: Number,
    required: true
  },
  month: {
    type: String,
    enum: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Paid', 'Partial', 'Unpaid'],
    default: 'Paid'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FeePayment', feePaymentSchema);
