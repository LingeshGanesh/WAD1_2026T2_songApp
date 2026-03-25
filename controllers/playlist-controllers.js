// Import model
const mongoose = require('mongoose');
const Playlist = require("../models/playlists-model");

// Controllers
// Read
exports.browse = async (req, res) => {
    let {sortby, isAscending} = req.query;
    sortby = sortby || 'creationDate'
    isAscending = (isAscending === 'true') || false;

    let allPlaylists;
    try {
        allPlaylists = await Playlist.retrievePublic();
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error calling database.")
    }

    allPlaylists.sort((a, b) => {
        let comp;
        if (sortby === 'name') {
            comp = (a.name > b.name)? 1: -1;
        } else {
            comp = a.creationDate - b.creationDate;
        }
        return comp * (isAscending? 1: -1);
    });
    
    res.render('playlists/browse', {allPlaylists, sortby, isAscending});
};

exports.playlistInfo = async (req, res) => {
    const {playlistID} = req.params;
    const user = null;

    if (!mongoose.isValidObjectId(playlistID)) {
        return res.status(404).render("not-found", {url: req.url});
    }
    
    try {
        let {playlist, songsList, songsDuration, playlistDuration} = await Playlist.getByID(playlistID, true);

        // If the playlist does not exist, show not found page
        if (!playlist) {return res.render('playlists/not-found');}

        // TODO: take user object ID from session and compare to playlist owner Object ID
        const isOwner = true; // (user === playlist.owner);

        // If non-owner is accessing private playlist, show not found page
        if (playlist.visibility === 'Private' && !isOwner) {
            return res.render('playlists/not-found');
        }

        res.render('playlists/playlist-info', {isOwner, playlist, songsList, songsDuration, playlistDuration});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error calling database.")
    }
};

// Create
exports.showCreationForm = async (req, res) => {
    // TODO: get username/UserID from session middleware
    const user = null;
    res.render('playlists/create-form', {user, error: false});
}

exports.createPlaylist = async (req, res) => {
    let { user, name, description, genre, visibility, songs } = req.body;

    // Input Validation
    user = user === ""? null : user; // May be taken from session instead
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
    try {
        const playlistDoc = await Playlist.insert({
            name: name,
            description: description,
            genre: genre,
            visibility: visibility,
            owner: user,
            songs: songs
            });
    
        res.render('playlists/create-success', {playlist: playlistDoc});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error adding playlist to the database.")
    }
}

// Update
exports.showEditForm = async (req, res) => {
    // TODO: get username/UserID from session
    const user = null;
    const {playlistID} = req.params;

    try {
        let {playlist, songsList} = await Playlist.getByID(playlistID, true);
        
        // TODO: do authorization here
        if (false) {//(user !== playlist.owner) {
            return res.status(403).send("You are not allowed to edit this form.")
        }
    
        res.render('playlists/edit-form', {user, error: false, playlist, songsList});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error calling database.")
    }
}

exports.updatePlaylist = async (req, res) => {
    let { user, playlistID, name, description, genre, visibility, songs } = req.body;

    // Input Validation
    user = user === ""? null : user;
    name = name.trim();
    description = description.trim();
    description = description === ""? null : description;
    genre = genre === ""? null: genre;
    
    // There is no song.
    if (songs === "") {
        return res.render('playlists/edit-form', { user, fields: {name, description, genre, visibility, songs}, error: true })
    }
    songs = songs.split(",");


    // Insert into the database
    // ID is required to direct user to their created playlist.
    try {
        await Playlist.updateByID(playlistID, {
            name: name,
            description: description,
            genre: genre,
            visibility: visibility,
            owner: user,
            songs: songs
            });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error updating playlist in the database.")
    }

    res.render('playlists/edit-success', {playlist: {name, _id: playlistID}});
}

// Delete
exports.showDeleteForm = async (req, res) => {
    // TODO: get username/UserID from session
    const user = null;
    const {playlistID} = req.params;

    try {
        let {playlist, songsList} = await Playlist.getByID(playlistID, true);
        
        // TODO: do authorization here
        if (false) {//(user !== playlist.owner) {
            return res.status(403).send("You are not allowed to edit this form.")
        }
    
        res.render('playlists/delete-form', {user, errorMsg: false, playlist, songsList});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error calling database.")
    }
}

exports.deletePlaylist = async (req, res) => {
    // TODO: get username/UserID from session
    const user = null;
    const {playlistID} = req.params;
    let declaration = req.body.declaration || [];
    declaration = Array.isArray(declaration)? declaration: [declaration];

    // TODO: authorize playlist deletion
    const {playlist, songsList} = await Playlist.getByID(playlistID, true);
    if (declaration.length < 2) {
        return res.render('playlists/delete-form', {user, errorMsg: "Please check the boxes to confirm deletion.", playlist, songsList});
    }

    if (false) {// (user !== playlist.owner) {
        return res.render('playlists/delete-form', {user, errorMsg: "Please enter your username to confirm deletion.", playlist, songsList});
    }

    // Delete playlist
    try {
        await Playlist.deleteByID(playlistID);
        res.render("playlists/delete-success", { playlist });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error deleting playlist from the database.")
    }

}