const express = require("express");
const songsController = require("../controllers/songs-controller");

const router = express.Router();

// in Create, Edit and Delete, check if user is logged in
// Read operations are open to all users
router.get("/browse", songsController.browse);
router.get("/create", songsController.showCreationForm);
router.post("/create", songsController.createSong);
router.get("/edit/:songID", songsController.showEditForm);
router.post("/edit/:songID", songsController.updateSong);
router.get("/delete/:songID", songsController.showDeleteForm);
router.post("/delete/:songID", songsController.deleteSong);
router.get("/:songID", songsController.songInfo);

module.exports = router;
