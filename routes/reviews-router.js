const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews-controller');

router.get('/', reviewController.getAllReviews);
router.post('/create', reviewController.createReview);
router.post('/update', reviewController.updateReview);
router.post('/delete', reviewController.deleteReview);

module.exports = router;