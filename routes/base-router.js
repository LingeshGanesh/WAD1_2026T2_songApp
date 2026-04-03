const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');

// Import controllers
const baseControllers = require("../controllers/base-controllers.js");

// Base Routes
router.get("/", baseControllers.guestpage);
router.get("/home",authMiddleware.isLoggedIn, baseControllers.homepage);


// Import routers
const playlistRouter = require("./playlist-router.js");
const eventsRouter = require("./events-router.js");
const reviewsRouter = require("./reviews-router.js");
const usersRouter = require("./users-router.js")
const albumRouter = require("./album-router.js")
const songsRouter = require("./songs-router.js");

// Branching Routes
router.use("/playlist", authMiddleware.isLoggedIn, playlistRouter);
router.use("/user", usersRouter);
router.use("/events", authMiddleware.isLoggedIn, eventsRouter);
router.use("/reviews", authMiddleware.isLoggedIn, reviewsRouter);
router.use("/album", authMiddleware.isLoggedIn, albumRouter);
router.use("/songs", authMiddleware.isLoggedIn, songsRouter);

// 404 Not Found
router.all(/.*/, authMiddleware.isLoggedIn, (req, res) => {
    res.status(404).render('status/not-found', { url: req.url });
})

// Export
module.exports = router;
