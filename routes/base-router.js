const express = require("express");
const router = express.Router();

// Import routers
const playlistRouter = require("./playlist-router.js")
const usersRouter = require("./user-routes.js")
// Branching Route
router.use("/playlist", playlistRouter);
router.use("/user", usersRouter);

// Export
module.exports = router;