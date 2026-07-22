const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true, // e.g. Single Room, Double Sharing, Triple Sharing
  },
  sharing: {
    type: Number,
    required: true, // e.g. 1, 2, 3
  },
  price: {
    type: Number,
    required: true, // monthly price
  },
  availability: {
    type: Number,
    required: true, // number of available rooms
    default: 1
  },
  roomNumber: {
    type: String,
    default: 'N/A',
  },
  roomFloor: {
    type: String,
    default: 'Ground',
  },
  roomStatus: {
    type: String,
    default: 'Available',
  },
  totalSeats: {
    type: Number,
    default: 1,
  },
  amenities: [String]
});

const pgSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a PG name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    landmark: { type: String, default: '' },
    mapCoordinates: { type: String, default: '' } // Google Map URL or iframe string
  },
  nearbyColleges: [String],
  facilities: [String], // e.g. ["Wifi", "Laundry", "Gym", "Food Included", "CCTV", "Power Backup"]
  gender: {
    type: String,
    required: true,
    enum: ['boys', 'girls', 'unisex']
  },
  images: [String], // image URLs
  rooms: [roomSchema],
  isApproved: {
    type: Boolean,
    default: true
  },
  ratingsAverage: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating must be at most 5'],
    set: val => Math.round(val * 10) / 10 // e.g. 4.6666 -> 4.7
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PG', pgSchema);
