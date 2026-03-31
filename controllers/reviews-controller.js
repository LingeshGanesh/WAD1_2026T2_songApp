const Review = require('../models/reviews-model');

// CREATE
exports.createReview = async (req, res) => {
  try {
    // const userId = req.session.user.id;
    const songId = req.params.songID;
    const userId = '507f1f77bcf86cd799439011'; // Placeholder user ID for testing
    // console.log("Creating review for user ID:", userId);
    const { rating, comment } = req.body;
    let error = ''

    if (!rating || !comment) {
      error = 'All fields are required';
    }

    if (rating < 1 || rating > 5) {
      error = 'Rating must be between 1 and 5';
    }

    if (error) {
      return res.render("reviews", {
        songId, 
        error: "All fields are required",
        reviews: await Review.findByID({ songId })
      });
    }
    
    await Review.createReview(userId, songId, rating, comment);

    res.redirect('/reviews/' + songId);
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
    // console.log(err.message)
    res.send('Error fetching reviews');
  }
};

exports.getReviewInfo = async (req, res) => {
  try {
    const songId = req.params.songID;
    const reviews = await Review.findByID({ songId });
    let output = '';
    let error = '';
    console.log(reviews);
    if (!reviews || reviews.length === 0) {
      output = 'No reviews found for this song';
    }
    res.render('reviews', { reviews, output, error, songId });
  } catch (err) {
    // console.log(err.message)
    res.send('Error fetching reviews');
  }
}

// UPDATE 
exports.updateReview = async (req, res) => {
  const songId = req.params.songID;
  const { reviewId } = req.body;
  let output = '';

  const review = await Review.findByReviewId(reviewId);
  // console.log("Review to update:", review);
  const old_comment = review.comment;
  const old_rating = review.rating;

  try {
    const { rating, comment } = req.body;

    if (rating && comment) {
      await Review.updateReview(reviewId, rating, comment);

    } else if (rating) {
      await Review.updateReview(reviewId, rating, old_comment);

    } else if (comment) {
      await Review.updateReview(reviewId, old_rating, comment);

    } else {
      output = 'No changes made. Please provide a new rating or comment.';
    }

    const reviews = await Review.findByID({ songId });

    res.render('reviews', { reviews, output, songId, error: null});
  } catch (err) {
    res.send('Error updating review');
  }
};

// DELETE 
exports.deleteReview = async (req, res) => {
  const songId = req.params.songID;
  try {
    const { reviewId } = req.body;

    await Review.deleteReview(reviewId);

    const reviews = await Review.findByID({ songId });

    res.render('reviews', { reviews, output, songId, error: null});
  } catch (err) {
    res.send('Error deleting review');
  }
};

// LOGGED IN (AUTHENTICATION)

// exports.isLoggedIn = (req, res, next) => {
//   if (!req.session.user) {
//     return res.redirect('/login');
//   }
//   next();
// };