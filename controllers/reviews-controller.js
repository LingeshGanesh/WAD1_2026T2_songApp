const Review = require('../models/reviews-model');
const Song = require("../models/songs-model");
const User = require('../models/users-model');
const statusPage = require('../modules/status-page');
const mongoose = require("mongoose");

// CREATE REVIEW
exports.createReview = async (req, res) => {
  try {

    const userId = req.session.user.id;
    const user = await User.findUserByID(userId);
    console.log("User found:", user);

    // song ID from URL parameters
    const songId = req.params.songID;

    const { rating, comment } = req.body;

    let error = '';
    // 404 if invalid song ID
    if (!mongoose.isValidObjectId(songId)) {
      return statusPage.renderNotFound(req, res);
    }

    // error validation
    if (!rating || !comment) {
      error = 'All fields are required';
    }

    if (error) {
      const reviews = await Review.findByID({ songId });


      if (reviews && reviews.length > 0) {
        for (let review of reviews) {
          const user = await User.findUserByID(review.userId);
          review.userName = user ? user.username : 'Unknown User';
        }
      }

      // pagination (5 reviews per page)
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


exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.retrieveAll();
    const songs = await Song.retrieveAll();
    let output = '';

    if (!reviews || reviews.length === 0) {
      output = 'No reviews found';
    }

    if (reviews && reviews.length > 0) {
      for (let review of reviews) {
        const user = await User.findUserByID(review.userId);
        review.userName = user ? user.username : 'Unknown User';
      }
    }

    const limit = 5;
    const totalReviews = reviews ? reviews.length : 0;
    const totalPages = Math.ceil(totalReviews / limit);
    const page = Math.max(1, Math.min(parseInt(req.query.page) || 1, totalPages));
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews ? reviews.slice(startIndex, endIndex) : [];


    res.render('reviews/display-reviews', {
      reviews: paginatedReviews,
      songs,
      output,
      page,
      totalPages,
      totalReviews
    });

  } catch (err) {
    res.send('Error fetching reviews');
  }
};

exports.getReviewInfo = async (req, res) => {
  // 404 if invalid song ID
  const songId = req.params.songID;
  if (!mongoose.isValidObjectId(songId)) {
    return statusPage.renderNotFound(req, res);
  }

  try {
    const songId = req.params.songID;
    let reviews = await Review.findByID({ songId });

    const song = await Song.findByID(songId);
    const songTitle = song.title;

    if (reviews && reviews.length > 0) {
      for (let review of reviews) {
        const user = await User.findUserByID(review.userId);
        review.userName = user ? user.username : 'Unknown User';
      }
    }

    reviews = reviews.reverse();

    const limit = 5;
    const totalReviews = reviews ? reviews.length : 0;
    const totalPages = Math.ceil(totalReviews / limit);
    const page = Math.max(1, Math.min(parseInt(req.query.page) || 1, totalPages));
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews ? reviews.slice(startIndex, endIndex) : [];

    let output = '';
    let error = '';


    // if no reviews
    if (!reviews || reviews.length === 0) {
      output = 'No reviews found for this song';
    }

    res.render('reviews/reviews', {
      reviews: paginatedReviews,
      songTitle,
      output,
      error,
      songId,
      page,
      totalPages,
      totalReviews
    });

  } catch (err) {
    console.log(err.message)
    res.send('Error fetching reviews for this song');
  }
}


exports.updateReview = async (req, res) => {
  const songId = req.params.songID;
  const { reviewId } = req.body;

  const review = await Review.findByReviewId(reviewId);
  if (!review) {
    return res.send('Review not found');
  }
  // 404 if invalid song ID
  if (!mongoose.isValidObjectId(songId)) {
    return statusPage.renderNotFound(req, res);
  }

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


exports.deleteReview = async (req, res) => {
  const songId = req.params.songID;
  const { reviewId } = req.body;

  if (!mongoose.isValidObjectId(songId)) {
    return statusPage.renderNotFound(req, res);
  }

  try {
    const review = await Review.findByReviewId(reviewId);

    if (!review) {
      return res.send('Review not found');
    }


    if (review.userId.toString() !== req.session.user.id) {
      return res.send('You are not authorized to delete this review');
    }

    await Review.deleteReview(reviewId);

    res.redirect('/reviews/' + songId);

  } catch (err) {
    res.send('Error deleting review');
  }
};
