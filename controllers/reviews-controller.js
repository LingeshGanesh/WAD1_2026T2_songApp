// Import Model
const Song = require("../models/songs-model");
const Review = require("./../models/reviews-model");

exports.getIndex = async (req, res) => {
	const msg = ""
  res.render("reviews/reviews-form", {msg});
};

//DUMMY USER ID TO BE USED ONLY UNTIL AUTH AND SESSION IS ONLINE
const userId = "69bc23ebd3cd6548aad26bdb";
// DUMMY
// DUMMY
// DUMMY
// REMEMBER TO CHANGE LATER PLEASE

exports.createReview = async (req, res) => {
  const songId = req.body.songId
	const rating = req.body.rating
	const comment = req.body.comment
	const author = userId

	let newReview = { song: songId, rating: rating, comment: comment, author: author};

	try {
			let msg = `Event has been added successfully.<br><br>Song: ${songId}<br>Rating: ${rating}<br>Comment: ${comment}`;
			let result = await Review.create(newReview); // when i change to addReviewBD doesnt work
			console.log("Review added:" + result);

			res.render("reviews/reviews-form", {songId, rating, comment, msg, result});

	} catch (error) {
			console.error(error);
			let result = "fail";
			let msg = "Error adding review";
			res.render("reviews/reviews-form", {songId, rating, comment, msg, result, error});
	}
};

exports.retrieveAll = async (req, res) => {
	try {
		let reviewList = await Review.retrieveAll();// fetch all the list    
		console.log(reviewList);
		res.render("reviews/display-events", { reviewList }); // Render the EJS form view and pass the posts
	} catch (error) {
		console.error(error);
		res.send("Error reading database"); // Send error message if fetching fails
	}
};