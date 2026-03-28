const express = require("express");
const songsController = require("../controllers/songs-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = express.Router();

// in Create, Edit and Delete, check if user is logged in
// Read operations are open to all users
router.get("/browse", songsController.browse);
router.get("/create", authMiddleware.isLoggedIn, songsController.showCreationForm);
router.post("/create", authMiddleware.isLoggedIn, songsController.createSong);
router.get("/edit/:songID", authMiddleware.isLoggedIn, songsController.showEditForm);
router.post("/edit/:songID", authMiddleware.isLoggedIn, songsController.updateSong);
router.get("/delete/:songID", authMiddleware.isLoggedIn, songsController.showDeleteForm);
router.post("/delete/:songID", authMiddleware.isLoggedIn, songsController.deleteSong);
router.get("/:songID", songsController.songInfo);

module.exports = router;
