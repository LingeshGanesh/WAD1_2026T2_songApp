const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, "userId is required"] 
    },
  songId: { 
    type: String, 
    ref:'Song',
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

exports.findByID = function (songId) {
    console.log("Finding reviews for song ID:", songId);
    return Review.find( songId );
};

exports.findByReviewId = function (reviewId) {
    console.log("Finding review for review ID:", reviewId);
    return Review.findById(reviewId);
};

exports.createReview = async (userId, songId, rating, comment) => {
  const review = new Review({
    userId,
    songId,
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
