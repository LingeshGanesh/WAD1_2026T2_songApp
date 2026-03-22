// Import model
const Playlist = require("../models/playlists-model");
const Song = require("./../models/songs-model.js");

// Controllers
exports.browse = async (req, res) => {
    const allPlaylists = await Playlist.retrievePublic();
    
    res.render('playlists/browse', {allPlaylists});
};

exports.playlistInfo = async (req, res) => {
    const {playlistID} = req.params;
    
    let {playlist, songsList, songsDuration} = await Playlist.getByID(playlistID, true);

    res.render('playlists/playlist-info', {playlist, songsList, songsDuration});
};

exports.showCreationForm = async (req, res) => {
    // TODO: get username/UserID from session middleware
    const user = null;
    res.render('playlists/create-form', {user, error: false});
}

exports.create = async (req, res) => {
    let { user, name, description, genre, visibility, songs } = req.body;

    // Input Validation
    user = user === ""? null : user;
    name = name.trim();
    description = description.trim();
    description = description === ""? null : description;
    genre = genre === ""? null: genre;
    
    // There is no song.
    if (songs === "") {
        return res.render('playlists/create-form', { user, fields: {name, description, genre, visibility, songs}, error: true })
    }
    songs = songs.split(",");


    // Insert into the database
    // ID is required to direct user to their created playlist.
    const playlistDoc = await Playlist.insert({
        name: name,
        description: description,
        genre: genre,
        visibility: visibility,
        owner: user,
        songs: songs
        });

    res.render('playlists/create-success', {playlist: playlistDoc});
}

exports.showEditForm = async (req, res) => {
    // TODO: get username/UserID from session middleware
    const user = null;
    const {playlistID} = req.params;

    let {playlist, songsList, songsDuration} = await Playlist.getByID(playlistID, true);
    
    res.render('playlists/edit-form', {user, error: false, playlist, songsList, songsDuration});
}

exports.update = async (req, res) => {
    let { user, playlistID, name, description, genre, visibility, songs } = req.body;

    // Input Validation
    user = user === ""? null : user;
    name = name.trim();
    description = description.trim();
    description = description === ""? null : description;
    genre = genre === ""? null: genre;
    
    // There is no song.
    if (songs === "") {
        return res.render('playlists/create-form', { user, fields: {name, description, genre, visibility, songs}, error: true })
    }
    songs = songs.split(",");


    // Insert into the database
    // ID is required to direct user to their created playlist.
    await Playlist.updateByID(playlistID, {
        name: name,
        description: description,
        genre: genre,
        visibility: visibility,
        owner: user,
        songs: songs
        });

    res.render('playlists/edit-success', {playlist: {name, _id: playlistID}});
}
