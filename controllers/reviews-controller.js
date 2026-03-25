const Review = require('../models/reviews-model');

// CREATE
exports.createReview = async (req, res) => {
  try {
    const { userId, songId, rating, comment } = req.body;

    if (!userId || !songId || !rating || !comment) {
      return res.send('All fields are required');
    }

    if (rating < 1 || rating > 5) {
      return res.send('Rating must be between 1 and 5');
    }

    const review = new Review({ userId, songId, rating, comment });
    await review.save();

    res.redirect('/reviews');
  } catch (err) {
    res.send('Error creating review: ' + err.message);
  }
};

// READ
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.render('reviews', { reviews });
  } catch (err) {
    res.send('Error fetching reviews');
  }
};


// UPDATE 
exports.updateReview = async (req, res) => {
  try {
    const { reviewId, rating, comment } = req.body;

    await Review.findByIdAndUpdate(reviewId, {
      rating,
      comment
    });

    res.redirect('/reviews');
  } catch (err) {
    res.send('Error updating review');
  }
};

// DELETE 
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;

    await Review.findByIdAndDelete(reviewId);
    res.redirect('/reviews');
  } catch (err) {
    res.send('Error deleting review');
  }
};