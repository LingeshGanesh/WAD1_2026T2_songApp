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

    if (error) {
      const reviews = await Review.findByID({ songId });
      // Populate usernames for each review
      if (reviews && reviews.length > 0) {
        for (let review of reviews) {
          const user = await User.findUserByID(review.userId);
          review.userName = user ? user.username : 'Unknown User';
        }
      }
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const totalReviews = reviews ? reviews.length : 0;
      const totalPages = Math.ceil(totalReviews / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedReviews = reviews ? reviews.slice(startIndex, endIndex) : [];
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

    // Populate usernames for each review
    if (reviews && reviews.length > 0) {
      for (let review of reviews) {
        const user = await User.findUserByID(review.userId);
        review.userName = user ? user.username : 'Unknown User';
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const totalReviews = reviews ? reviews.length : 0;
    const totalPages = Math.ceil(totalReviews / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews ? reviews.slice(startIndex, endIndex) : [];


    res.render('reviews/display-reviews', { reviews: paginatedReviews, songs, output, page, totalPages, totalReviews });
  } catch (err) {
    // console.log(err.message)
    res.send('Error fetching reviews');
  }
};

exports.getReviewInfo = async (req, res) => {
  try {
    const songId = req.params.songID;
    let reviews = await Review.findByID({ songId });
    const song = await Song.findByID(songId);
    const songTitle = song.title;
    const currentUser = req.session.user || null;
    // console.log("Current user:", currentUser);

    // Populate usernames for each review
    if (reviews && reviews.length > 0) {
      for (let review of reviews) {
        const user = await User.findUserByID(review.userId);
        review.userName = user ? user.username : 'Unknown User';
      }
    }
    reviews = reviews.reverse(); 
    
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const totalReviews = reviews ? reviews.length : 0;
    const totalPages = Math.ceil(totalReviews / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews ? reviews.slice(startIndex, endIndex) : [];

    let output = '';
    let error = '';
    console.log(reviews);
    if (!reviews || reviews.length === 0) {
      output = 'No reviews found for this song';
    }
    res.render('reviews/reviews', { reviews: paginatedReviews, songTitle, output, error, songId, currentUser, page, totalPages, totalReviews });
  } catch (err) {
    console.log(err.message)
    res.send('Error fetching reviews for this song');
  }
}

// UPDATE 
exports.updateReview = async (req, res) => {
  const songId = req.params.songID;
  const { reviewId } = req.body;

  if (!req.session.user) {
    return res.redirect('/user/login');
  }

  const review = await Review.findByReviewId(reviewId);
  if (!review) {
    return res.send('Review not found');
  }

  // Check if the current user owns the review
  if (review.userId.toString() !== req.session.user.id) {
    return res.send('You are not authorized to update this review');
  }

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
    }

    res.redirect('/reviews/' + songId);
  } catch (err) {
    console.log(err.message);
    res.send('Error updating review');
  }
};

// DELETE 
exports.deleteReview = async (req, res) => {
  const songId = req.params.songID;
  const { reviewId } = req.body;

  if (!req.session.user) {
    return res.redirect('/user/login');
  }

  try {
    const review = await Review.findByReviewId(reviewId);
    if (!review) {
      return res.send('Review not found');
    }

    // Check if the current user owns the review
    if (review.userId.toString() !== req.session.user.id) {
      return res.send('You are not authorized to delete this review');
    }

    await Review.deleteReview(reviewId);
    res.redirect('/reviews/' + songId);
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