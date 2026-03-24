const express = require("express");
const router = express.Router();

const reviewsController = require('./../controllers/reviews-controller');

const Review = require("../models/reviews-model");
const Song = require("../models/songs-model");

// display form
router.get("/add-review", reviewsController.getIndex);
router.post("/add-review", reviewsController.createReview);


module.exports = router;