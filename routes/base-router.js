const express = require("express");
const router = express.Router();

// Import routers
const playlistRouter = require("./playlist-router.js");
const songRouter = require("./song-router.js");

// Branching Route
router.use("/playlist", playlistRouter);
router.use("/song", songRouter);

// Export
module.exports = router;
