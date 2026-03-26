const express = require("express");
const router = express.Router();
const Song = require("./../models/songs-model.js");

// Import routers
const playlistRouter = require("./playlist-router.js")
const albumRouter = require("./album-router.js")

// Branching Route
router.use("/playlist", playlistRouter);
router.use("/album", albumRouter);

// TODO: Remove these route when insert song popup is implemented.
router.get("/song/search/:songID", async (req, res) => {
    const {songID} = req.params;
    const searchedSong = await Song.findById(songID);
    res.send(searchedSong);
})
router.get("/song/:songID", async (req, res) => {
    const {songID} = req.params;
    const searchedSong = await Song.findById(songID);
    res.redirect(searchedSong.youtubeUrl);
});

// Export
module.exports = router;