const express = require("express");
const router = express.Router();
const Song = require("./../models/songs-model.js");
const authMiddleware = require('../middleware/auth-middleware');

// Import routers
const playlistRouter = require("./playlist-router.js");
const eventsRouter = require("./events-router.js");
const reviewsRouter = require("./reviews-router.js");
const usersRouter = require("./users-router.js")
const albumRouter = require("./album-router.js")
const songsRouter = require("./songs-router.js");

// Branching Route
router.get("/homepage", (req, res) => res.render("base"));
router.use("/playlist", authMiddleware.isLoggedIn, playlistRouter);
router.use("/user", usersRouter);
router.use("/events", eventsRouter);
router.use("/reviews", reviewsRouter);
router.use("/album", albumRouter);
router.use("/songs", songsRouter);

// 404 Not Found
router.all(/.*/, (req, res) => {
    res.status(404).render('not-found', { url: req.url, user: req.session.user || null });
})

// Export
module.exports = router;
