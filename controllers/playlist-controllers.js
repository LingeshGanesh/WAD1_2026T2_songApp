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

exports.create = async (req, res) => {
    let { user, name, description, genre, isPublic, songs } = req.body;

    // Input Validation
    user = user === ""? null : user;
    name = name.trim();
    description = description.trim();
    isPublic = isPublic.toLowerCase() === 'true';
    songs = songs.split(",") || [];

    console.log(songs);

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