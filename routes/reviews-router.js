const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews-controller');
const authMiddleware = require('../middleware/auth-middleware');

router.get('/', authMiddleware.isLoggedIn, reviewController.getAllReviews);
router.get("/:songID", authMiddleware.isLoggedIn, reviewController.getReviewInfo);
router.post('/create/:songID', authMiddleware.isLoggedIn, reviewController.createReview);
router.post('/update/:songID', authMiddleware.isLoggedIn, reviewController.updateReview);
router.post('/delete/:songID', authMiddleware.isLoggedIn, reviewController.deleteReview);

module.exports = router;

