const express = require("express");
const router = express.Router();

// Set up middleware to parse multipart files
const multer = require("multer");
const thumbParser = multer().single("thumbnail");

// Import controllers
const playlistControllers = require("../controllers/playlist-controllers.js");

// Routes
router.get("/browse", playlistControllers.browse);

// Creation
router.get("/create", playlistControllers.showCreationForm);
router.post("/create", thumbParser, playlistControllers.createPlaylist);

// Edit
router.get("/edit/:playlistID", playlistControllers.showEditForm);
router.post("/edit/:playlistID", thumbParser, playlistControllers.updatePlaylist);

// Delete
router.get("/delete/:playlistID", playlistControllers.showDeleteForm);
router.post("/delete/:playlistID", playlistControllers.deletePlaylist);

router.get("/:playlistID", playlistControllers.playlistInfo);

// Export
module.exports = router;