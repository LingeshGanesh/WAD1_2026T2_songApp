const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews-controller');

router.get('/', reviewController.getAllReviews);
router.get("/:songID", reviewController.getReviewInfo);
router.post('/create/:songID', reviewController.createReview);
router.post('/update/:songID', reviewController.updateReview);
router.post('/delete/:songID', reviewController.deleteReview);

module.exports = router;

