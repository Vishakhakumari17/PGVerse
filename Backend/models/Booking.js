const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number, // in months
    required: true,
    default: 1
  },
  advancePaymentAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  receiptNumber: {
    type: String,
    unique: true,
    required: true
  },
  transactionId: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
