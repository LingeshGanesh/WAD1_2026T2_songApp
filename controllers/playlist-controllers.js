// Import model
const Playlist = require("../models/playlists-model");
const Song = require("./../models/songs-model.js");

// Private Functions
function convertTime(timeSec) {
    const minute = Math.floor(timeSec / 60);
    const second = timeSec % 60;

    return `${minute}:${second.toString().padStart(2, "0")}`;
}

// Controllers
exports.browse = async (req, res) => {
    const allPlaylists = await Playlist.retrieveAll();
    
    res.render('playlists/browse', {allPlaylists});
};

exports.playlistInfo = async (req, res) => {
    const {playlistID} = req.params;
    console.log("Gathering playlist information")
    let {playlist, songsList, songsDuration} = await Playlist.getByID(playlistID, true);

    res.render('playlists/playlist-info', {playlist, songsList, songsDuration});
};

exports.showCreationForm = async (req, res) => {
    // TODO: get username/UserID from session middleware
    const user = null;
    res.render('playlists/create-form', {user, error: false});
}

exports.create = async (req, res) => {
    let { user, name, description, genre, isPublic, songs } = req.body;

    // Input Validation
    user = user === ""? null : user;
    name = name.trim();
    description = description.trim();
    isPublic = isPublic.toLowerCase() === 'true';
    
    // There is no song.
    if (songs === "") {
        return res.render('playlists/create-form', { user, name, description, genre, isPublic, songs, error: true })
    }
    songs = songs.split(",");


    // Insert into the database
    // ID is required to direct user to their created playlist.
    const playlistDoc = await Playlist.insert({
        name: name,
        description: description,
        genre: genre,
        isPublic: isPublic,
        owner: user,
        songs: songs
        });

    res.render('playlists/create-success', {playlist: playlistDoc});
}