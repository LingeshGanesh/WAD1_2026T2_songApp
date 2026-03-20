// Import model
const Playlist = require("../models/playlists-model");

// Controllers
exports.browse = async (req, res) => {
    const allPlaylists = await Playlist.retrieveAll();
    
    res.render('playlists/browse', {allPlaylists});
};

exports.playlistInfo = async (req, res) => {
    const {playlistID} = req.params;
    const playlist = await Playlist.getByID(playlistID);
    res.render('playlists/playlist-info', {playlist});
};