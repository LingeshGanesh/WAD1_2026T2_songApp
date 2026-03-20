const express = require("express");
const router = express.Router();

// Import routers
const playlistRouter = require("./playlist-router.js");

// Branching Route
router.get("/playlist", playlistRouter);

// Export
module.exports = router;