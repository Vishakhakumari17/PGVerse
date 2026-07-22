const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferredLocation: {
    type: String,
    required: [true, 'Please add a preferred location']
  },
  budget: {
    type: Number,
    required: [true, 'Please add a budget']
  },
  gender: {
    type: String,
    enum: ['boys', 'girls', 'unisex'],
    required: [true, 'Please select a gender preference']
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'approved', 'rejected'],
    default: 'pending'
  },
  assignedPGs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG'
  }],
  acceptedPG: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
