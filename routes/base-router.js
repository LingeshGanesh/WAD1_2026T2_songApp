const express = require("express");
const router = express.Router();
const Song = require("./../models/songs-model.js");

// Import routers
const playlistRouter = require("./playlist-router.js");
const eventsRouter = require("./events-router.js");
const songsRouter = require("./songs-router.js");

// Branching Route
router.get("/", (req, res) => {
    res.render("base");
});

router.use("/playlist", playlistRouter);
router.use("/events", eventsRouter);
router.use("/songs", songsRouter);

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

// 404 Not Found
router.all(/.*/, (req, res) => {
    res.status(404).render('not-found', {url: req.url});
})

// Export
module.exports = router;
