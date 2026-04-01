const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');

// Import controllers
const baseControllers = require("../controllers/base-controllers.js");

// Base Routes
router.get("/", baseControllers.homepage);
// TODO: Keep/remove on consensus
router.get("/homepage", (req, res) => res.redirect("/"));


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
router.use("/events", eventsRouter);
router.use("/reviews", reviewsRouter);
router.use("/album", albumRouter);
router.use("/songs", songsRouter);

// 404 Not Found
router.all(/.*/, (req, res) => {
    res.status(404).render('status/not-found', { url: req.url, user: req.session.user || null });
})

// Export
module.exports = router;
