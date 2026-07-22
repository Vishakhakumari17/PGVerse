const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject for your complaint'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please describe your complaint']
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  resolutionDetails: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
