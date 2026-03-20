// Import model
const Playlist = require("../models/playlists-model");

// Controllers
exports.browse = async (req, res) => {
    // const playlists = await Playlist.retrieveAll();
    console.log("Browse!")
    res.render('playlists/browse');
};