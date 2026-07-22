const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  images: [String],
  ownerReply: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function(pgId) {
  const obj = await this.aggregate([
    {
      $match: { pg: pgId }
    },
    {
      $group: {
        _id: '$pg',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await this.model('PG').findByIdAndUpdate(pgId, {
        ratingsAverage: obj[0].averageRating,
        ratingsCount: obj[0].count
      });
    } else {
      await this.model('PG').findByIdAndUpdate(pgId, {
        ratingsAverage: 0,
        ratingsCount: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.pg);
});

// Call getAverageRating before delete
reviewSchema.post('remove', async function() {
  await this.constructor.getAverageRating(this.pg);
});

module.exports = mongoose.model('Review', reviewSchema);
