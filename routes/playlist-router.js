const express = require("express");
const router = express.Router();

// Import controllers
const playlistControllers = require("../controllers/playlist-controllers.js");
const Song = require("./../models/songs-model.js");

// Routes
router.get("/browse", playlistControllers.browse);

// Creation
router.get("/create", playlistControllers.showCreationForm);
router.post("/create", playlistControllers.create);

// Edit
router.get("/edit/:playlistID", playlistControllers.showEditForm);
router.post("/edit/:playlistID", playlistControllers.update);


// TODO: Remove this route when insert song popup is implemented.
router.get("/random-songs", async (req, res) => {
    const allSongs = await Song.find();
    const i = Math.floor(Math.random() * allSongs.length) % allSongs.length;
    res.send(allSongs[i]);
})

router.get("/:playlistID", playlistControllers.playlistInfo);

// Export
module.exports = router;