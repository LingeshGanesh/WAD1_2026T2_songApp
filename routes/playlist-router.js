const express = require("express");
const router = express.Router();

// Import controllers
const playlistControllers = require("../controllers/playlist-controllers.js");

// Routes
router.get("/browse", playlistControllers.browse);
router.get("/:playlistID", playlistControllers.playlistInfo);

// Export
module.exports = router;