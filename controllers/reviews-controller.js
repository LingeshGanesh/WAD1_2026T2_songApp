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

    await Review.createReview(userId, songId, rating, comment);

    res.redirect('/reviews');
  } catch (err) {
    res.send('Error creating review: ' + err.message);
  }
};

// READ
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.retrieveAll();
    res.render('reviews', { reviews, output:null });
  } catch (err) {
    console.log(err.message)
    res.send('Error fetching reviews');
  }
};


// UPDATE 
exports.updateReview = async (req, res) => {
  let output = '';

  try {
    const { reviewId, rating, comment } = req.body;

    if (rating && comment) {
      await Review.updateReview(reviewId, rating, comment);

    } 
    else if (!rating && comment) {
      output = 'Please include rating!';
    } 
    else {
      output = 'Please include comment!';
    }

    const reviews = await Review.retrieveAll();

    res.render('reviews', { reviews, output });
  } catch (err) {
    res.send('Error updating review');
  }
};

// DELETE 
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;

    await Review.deleteReview(reviewId);

    res.redirect('/reviews');
  } catch (err) {
    res.send('Error deleting review');
  }
};