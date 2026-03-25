const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: [true, "userId is required"] 
    },
  songId: { 
    type: String, 
    required: [true, "songId is required"] 
    },
  rating: { 
    type: Number, 
    required: [true, "rating is required"] 
    },
  comment: {
    type: String, 
    required: [true, "comment is required"] 
    },
  createdAt: { 
    type: Date, 
    default: Date.now 
    }
});

module.exports = mongoose.model('Review', reviewSchema);