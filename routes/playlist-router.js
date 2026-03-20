const express = require("express");
const router = express.Router();

// Import controllers
const playlistControllers = require("../controllers/playlist-controllers.js");

// Routes
router.get("/browse", playlistControllers.browse);

// Export
module.exports = router;