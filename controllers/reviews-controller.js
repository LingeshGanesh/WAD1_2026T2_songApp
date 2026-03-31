const Review = require('../models/reviews-model');
const Song = require("../models/songs-model");
const User = require('../models/users-model');

// CREATE
exports.createReview = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/user/login');
    }
    const userId = req.session.user.id;
    const user = await User.findUserByID(userId);
    console.log("User found:", user);
    const userName = user.username;
    const songId = req.params.songID;
    // const userId = '507f1f77bcf86cd799439011'; // Placeholder user ID for testing
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
        songTitle: (await Song.findByID(songId)).title,
        songId, 
        error: "All fields are required",
        reviews: reviews,
        currentUser: req.session.user || null
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
    const songs = await Song.retrieveAll();
    let output = '';

    if (!reviews || reviews.length === 0) {
      output = 'No reviews found';
    }

    res.render('reviews/display-reviews', { reviews, songs, output });
  } catch (err) {
    // console.log(err.message)
    res.send('Error fetching reviews');
  }
};

exports.getReviewInfo = async (req, res) => {
  try {
    const songId = req.params.songID;
    const reviews = await Review.findByID({ songId });
    const song = await Song.findByID(songId);
    const songTitle = song.title;
    const currentUser = req.session.user || null;
    console.log("Current user:", currentUser);

    // Populate usernames for each review
    if (reviews && reviews.length > 0) {
      for (let review of reviews) {
        const user = await User.findUserByID(review.userId);
        review.userName = user ? user.username : 'Unknown User';
      }
    }

    let output = '';
    let error = '';
    console.log(reviews);
    if (!reviews || reviews.length === 0) {
      output = 'No reviews found for this song';
    }
    res.render('reviews', { reviews, songTitle, output, error, songId, currentUser });
  } catch (err) {
    console.log(err.message)
    res.send('Error fetching reviews for this song');
  }
}

// UPDATE 
exports.updateReview = async (req, res) => {
  const songId = req.params.songID;
  const { reviewId } = req.body;
  let output = '';

  if (!req.session.user) {
    return res.redirect('/user/login');
  }

  const song = await Song.findByID(songId);
  const songTitle = song.title;

  const currentUser = req.session.user || null;

  const userName = currentUser.username;

  const review = await Review.findByReviewId(reviewId);
  if (!review) {
    return res.send('Review not found');
  }

  // Check if the current user owns the review
  if (review.userId.toString() !== req.session.user.id) {
    return res.send('You are not authorized to update this review');
  }

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
    
    // Populate usernames for each review
    if (reviews && reviews.length > 0) {
      for (let review of reviews) {
        const user = await User.findUserByID(review.userId);
        review.userName = user ? user.username : 'Unknown User';
      }
    }

    res.render('reviews', { reviews, songTitle, output, songId, error: null, currentUser: req.session.user });
  } catch (err) {
    console.log(err.message);
    res.send('Error updating review');
  }
};

// DELETE 
exports.deleteReview = async (req, res) => {
  const songId = req.params.songID;
  try {
    const { reviewId } = req.body;

    const currentUser = req.session.user || null;

    const userName = currentUser.username;

    if (!req.session.user) {
      return res.redirect('/user/login');
    }

    const review = await Review.findByReviewId(reviewId);
    if (!review) {
      return res.send('Review not found');
    }

    // Check if the current user owns the review
    if (review.userId.toString() !== req.session.user.id) {
      return res.send('You are not authorized to delete this review');
    }

    await Review.deleteReview(reviewId);

    const reviews = await Review.findByID({ songId });
    const song = await Song.findByID(songId);
    const songTitle = song.title;
    
    // Populate usernames for each review
    if (reviews && reviews.length > 0) {
      for (let review of reviews) {
        const user = await User.findUserByID(review.userId);
        review.userName = user ? user.username : 'Unknown User';
      }
    }
    
    let output = 'Review deleted successfully.';
    res.render('reviews', { reviews, songTitle, output, songId, error: null, currentUser: req.session.user });
  } catch (err) {
    res.send('Error deleting review');
  }
};

// LOGGED IN (AUTHENTICATION)

exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};