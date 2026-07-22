const mongoose = require('mongoose');

const offlineAdmissionSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    required: true
  },
  roomType: {
    type: String,
    default: 'General'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  fatherName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  parentMobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String, // Base64 image
    default: ''
  },
  aadharCard: {
    type: String, // Aadhar Card Number
    required: true,
    trim: true
  },
  monthlyFee: {
    type: Number,
    required: true,
    min: 0
  },
  paidFee: {
    type: Number,
    required: true,
    min: 0
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  months: {
    type: Number,
    default: 1
  },
  portalPassword: {
    type: String,
    default: 'Galaxy@1234'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OfflineAdmission', offlineAdmissionSchema);
