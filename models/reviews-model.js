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

const Review = mongoose.model('Review', reviewSchema, 'reviews');

exports.retrieveAll = function() {
    return Review.find();
};

exports.findByID = function (songID) {
    return Review.findOne({ songID });
};

exports.createReview = async (userId, rating, comment) => {
  const review = new Review({
    userId,
    rating,
    comment
  });

  return await review.save();
};

exports.updateReview = async (reviewId, rating, comment) => {
  return await Review.findByIdAndUpdate(reviewId, {
    rating,
    comment
  });
};

exports.deleteReview = async (reviewId) => {
  return await Review.findByIdAndDelete(reviewId);
};
