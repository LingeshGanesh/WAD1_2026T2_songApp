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

exports.showCreationForm = async (req, res) => {
    // TODO: get username/UserID from session middleware
    const user = null;
    res.render('playlists/create-form', {user});
}

// exports.createSongSlot = async (req, res) => {
//     const slotNum = parseInt(req.query.slotnum);

//     // TODO: get song from the model
//     const song = {
//         "_id": {
//             "$oid": "69bd3ac637ba9aa3d3421557"
//         },
//         "title": "Two Time",
//         "artist": "Jack Stauber",
//         "album": "Inchman / Two Time",
//         "genre": "Indie",
//         "duration": 42,
//         "youtubeUrl": "https://youtu.be/FNt8xXCJplY"
//         }

//     res.render('playlists/song-slot', {song, slotNum});
// }

exports.create = async (req, res) => {

}