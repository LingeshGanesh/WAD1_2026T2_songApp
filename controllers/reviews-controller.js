// Dependencies: Review model, Song model, User model
const Review = require('../models/reviews-model');
const Song = require("../models/songs-model");
const User = require('../models/users-model');

// CREATE - Add a new review for a song
exports.createReview = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.redirect('/user/login');
    }

    // Get user details from session
    const userId = req.session.user.id;
    const user = await User.findUserByID(userId);
    console.log("User found:", user);
    const userName = user.username;

    // Get song ID from URL parameters
    const songId = req.params.songID;

    // Extract form data
    const { rating, comment } = req.body;
    let error = ''

    // Validate required fields
    if (!rating || !comment) {
      error = 'All fields are required';
    }

    // If validation errors, re-render form with existing reviews
    if (error) {
      const reviews = await Review.findByID({ songId });

      // Add usernames to reviews for display
      if (reviews && reviews.length > 0) {
        for (let review of reviews) {
          const user = await User.findUserByID(review.userId);
          review.userName = user ? user.username : 'Unknown User';
        }
      }

      // Handle pagination
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const totalReviews = reviews ? reviews.length : 0;
      const totalPages = Math.ceil(totalReviews / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedReviews = reviews ? reviews.slice(startIndex, endIndex) : [];

      // Re-render the reviews page with error message
      return res.render("reviews/reviews", {
        songTitle: (await Song.findByID(songId)).title,
        songId,
        error: error,
        reviews: paginatedReviews,
        currentUser: req.session.user || null,
        page,
        totalPages,
        totalReviews
      });
    }

    // Create the review in database
    await Review.createReview(userId, songId, rating, comment);

    // Redirect back to reviews page
    res.redirect('/reviews/' + songId);
  } catch (err) {
    res.send('Error creating review: ' + err.message);
  }
};

// READ - Get all reviews across all songs (display-reviews page)
exports.getAllReviews = async (req, res) => {
  try {
    // Fetch all reviews and songs from database
    const reviews = await Review.retrieveAll();
    const songs = await Song.retrieveAll();
    let output = '';

    // Set message if no reviews exist
    if (!reviews || reviews.length === 0) {
      output = 'No reviews found';
    }

    // Add usernames to reviews for display
    if (reviews && reviews.length > 0) {
      for (let review of reviews) {
        const user = await User.findUserByID(review.userId);
        review.userName = user ? user.username : 'Unknown User';
      }

      // Sort reviews by most recent first
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const totalReviews = reviews ? reviews.length : 0;
    const totalPages = Math.ceil(totalReviews / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews ? reviews.slice(startIndex, endIndex) : [];

    // Render the display-reviews page
    res.render('reviews/display-reviews', { reviews: paginatedReviews, songs, output, page, totalPages, totalReviews });
  } catch (err) {
    res.send('Error fetching reviews');
  }
};

// READ - Get reviews for a specific song (individual song reviews page)
exports.getReviewInfo = async (req, res) => {
  try {
    // Get song ID from URL
    const songId = req.params.songID;

    // Fetch reviews for this song
    let reviews = await Review.findByID({ songId });

    // Get song details
    const song = await Song.findByID(songId);
    const songTitle = song.title;
    const currentUser = req.session.user || null;

    // Add usernames to reviews for display
    if (reviews && reviews.length > 0) {
      for (let review of reviews) {
        const user = await User.findUserByID(review.userId);
        review.userName = user ? user.username : 'Unknown User';
      }
    }

    // Reverse to show most recent first
    reviews = reviews.reverse();

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const totalReviews = reviews ? reviews.length : 0;
    const totalPages = Math.ceil(totalReviews / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews ? reviews.slice(startIndex, endIndex) : [];

    let output = '';
    let error = '';

    // Set message if no reviews for this song
    if (!reviews || reviews.length === 0) {
      output = 'No reviews found for this song';
    }

    // Render the individual song reviews page
    res.render('reviews/reviews', { reviews: paginatedReviews, songTitle, output, error, songId, currentUser, page, totalPages, totalReviews });
  } catch (err) {
    console.log(err.message)
    res.send('Error fetching reviews for this song');
  }
}

// UPDATE - Modify an existing review
exports.updateReview = async (req, res) => {
  // Get parameters from URL and form
  const songId = req.params.songID;
  const { reviewId } = req.body;

  // Check authentication
  if (!req.session.user) {
    return res.redirect('/user/login');
  }

  // Verify review exists
  const review = await Review.findByReviewId(reviewId);
  if (!review) {
    return res.send('Review not found');
  }

  // Check ownership - users can only update their own reviews
  if (review.userId.toString() !== req.session.user.id) {
    return res.send('You are not authorized to update this review');
  }

  // Store original values for fallback
  const old_comment = review.comment;
  const old_rating = review.rating;

  try {
    // Get new values from form
    const { rating, comment } = req.body;

    // Update based on what fields were provided
    if (rating && comment) {
      // Both rating and comment provided
      await Review.updateReview(reviewId, rating, comment);
    } else if (rating) {
      // Only rating provided, keep old comment
      await Review.updateReview(reviewId, rating, old_comment);
    } else if (comment) {
      // Only comment provided, keep old rating
      await Review.updateReview(reviewId, old_rating, comment);
    }

    // Redirect back to reviews page
    res.redirect('/reviews/' + songId);
  } catch (err) {
    console.log(err.message);
    res.send('Error updating review');
  }
};

// DELETE - Remove a review
exports.deleteReview = async (req, res) => {
  // Get parameters
  const songId = req.params.songID;
  const { reviewId } = req.body;

  // Check authentication
  if (!req.session.user) {
    return res.redirect('/user/login');
  }

  try {
    // Verify review exists
    const review = await Review.findByReviewId(reviewId);
    if (!review) {
      return res.send('Review not found');
    }

    // Check ownership - users can only delete their own reviews
    if (review.userId.toString() !== req.session.user.id) {
      return res.send('You are not authorized to delete this review');
    }

    // Delete the review
    await Review.deleteReview(reviewId);

    // Redirect back to reviews page
    res.redirect('/reviews/' + songId);
  } catch (err) {
    res.send('Error deleting review');
  }
};

// MIDDLEWARE - Authentication check
exports.isLoggedIn = (req, res, next) => {
  // Check if user session exists
  if (!req.session.user) {
    return res.redirect('/login');
  }
  // Continue to next middleware
  next();
};