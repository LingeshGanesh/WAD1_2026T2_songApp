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

// Retrieve all reviews from the database
exports.retrieveAll = async function() { 
    return await Review.find().sort({ createdAt: -1 }).lean();
};

// Find reviews for a specific song by songId
exports.findByID = function (songId) {
    // console.log("Finding reviews for song ID:", songId);
    return Review.find(songId);
};

// Find a single review by its reviewId
exports.findByReviewId = function (reviewId) {
    // console.log("Finding review for review ID:", reviewId);
    return Review.findById(reviewId);
};

// Find all reviews by a specific user
exports.findByUserId = function (userId) {
    return Review.find({ userId });
};

// Create a new review in the database
exports.createReview = async (userId, songId, rating, comment) => {
  const review = new Review({
    userId,
    songId,
    rating,
    comment
  });

  return await review.save();
};

// Update an existing review's rating and comment
exports.updateReview = async (reviewId, rating, comment) => {
  return await Review.findByIdAndUpdate(reviewId, {
    rating,
    comment
  });
};

// Delete a review by its reviewId
exports.deleteReview = async (reviewId) => {
  return await Review.findByIdAndDelete(reviewId);
};

// Delete many - Carolyn
exports.deleteManyByUserId = function (userId) {
    return Review.deleteMany({ userId });
};