// Import model
const mongoose = require('mongoose');
const Playlist = require("../models/playlists-model");
const User = require("../models/users-model");
const path = require("path");

// Private Method
function checkOwnership(user, playlist) {
    return (playlist.owner && user.id === playlist.owner.toString());
}

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

    let owners = []
    for (let play of allPlaylists) {
        if (play.owner) {
            const ownerObj = await User.findUserByID(play.owner);
            owners.push(ownerObj.username);
        } else {
            owners.push(null);
        }
    }
    
    res.render('playlists/browse', {allPlaylists, owners, sortby, isAscending});
};

exports.playlistInfo = async (req, res) => {
    const {playlistID} = req.params;
    const {user} = req.session;

    // The given playlistID is not a playlistID.
    if (!mongoose.isValidObjectId(playlistID)) {
        return res.status(404).render("not-found", {url: req.url});
    }
    
    try {
        let {playlist, songsList, songsDuration, playlistDuration} = await Playlist.getByID(playlistID, true);

        // If the playlist does not exist, show not found page
        if (!playlist) {return res.render('playlists/not-found');}

        // TODO: take user object ID from session and compare to playlist owner Object ID
        const isOwner = checkOwnership(user, playlist);

        // If non-owner is accessing private playlist, show not found page
        if (playlist.visibility === 'Private' && !isOwner) {
            return res.render('playlists/not-found');
        }

        // Get the playlist owner (unless unnecessary)
        let owner = null;
        if (playlist.owner) {
            owner = await User.findUserByID(playlist.owner);
            owner = owner.username;
        }

        res.render('playlists/playlist-info', {isOwner, playlist, owner, songsList, songsDuration, playlistDuration});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error calling database.")
    }
};

// Create
exports.showCreationForm = async (req, res) => {
    res.render('playlists/create-form', {error: false});
}

exports.createPlaylist = async (req, res) => {
    const {user} = req.session;
    let { name, description, visibility, songs } = req.body;
    let thumbnail = req.file;

    // Input Validation
    console.log("You are:", user.username);
    name = name.trim();
    description = description.trim();
    description = description === ""? null : description;
    
    // There is no song.
    if (songs === "") {
        return res.render('playlists/create-form', { user, fields: {name, description, thumbnail, visibility, songs}, error: true })
    }
    songs = songs.split(",");


    // Insert into the database
    try {
        const newPlaylist = {
            name: name,
            description: description,
            visibility: visibility,
            owner: user.id,
            songs: songs
        }

        // ID is required to direct user to their created playlist.
        // Therefore, playlistDoc is used, which contains the generated id.
        const playlistDoc = await Playlist.insert(newPlaylist);
        const playlistID = playlistDoc._id;

        if (thumbnail) {
            await Playlist.addThumbnail(playlistID, thumbnail);
        }
    
        res.render('playlists/create-success', {playlist: playlistDoc});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error adding playlist to the database.")
    }
}

// Update
exports.showEditForm = async (req, res) => {
    const {user} = req.session;
    const {playlistID} = req.params;

    try {
        let {playlist, songsList} = await Playlist.getByID(playlistID, true);
        
        // Only allow the owner to edit (Authorization)
        if (!checkOwnership(user, playlist)) {
            return res.status(403).send("You are not allowed to edit this playlist.")
        }
    
        res.render('playlists/edit-form', {error: false, playlist, songsList});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error calling database.")
    }
}

exports.updatePlaylist = async (req, res) => {
    const {user} = req.session;
    const {playlistID} = req.params;
    let { name, description, editThumb, visibility, songs } = req.body;
    let thumbnail = req.file;

    // Input Validation
    name = name.trim();
    description = description.trim();
    description = description === ""? null : description;
    editThumb = (editThumb === "true");
    
    // There is no song.
    if (songs === "") {
        return res.render('playlists/edit-form', { user, fields: {name, description, visibility, songs}, error: true })
    }
    songs = songs.split(",");


    // Insert into the database
    try {
        // Only allow the owner to edit (Authorization)
        const playlist = await Playlist.getByID(playlistID, false);
        if (!checkOwnership(user, playlist)) {
            return res.status(403).send("You are not allowed to edit this playlist.")
        }

        // Update non-thumbnail data
        const editedPlaylist = {
            name: name,
            description: description,
            visibility: visibility,
            songs: songs
        }

        await Playlist.updateByID(playlistID, editedPlaylist);

        // Update thumbnail data
        if (editThumb) {
            if (thumbnail) {
                await Playlist.addThumbnail(playlistID, thumbnail);
            } else {
                // No thumbnail provided. Clear the extension field
                await Playlist.deleteThumbnail(playlistID);
            }
        }
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
        
        // Only allow the owner to delete (Authorization)
        if (!checkOwnership(user, playlist)) {
            return res.status(403).send("You are not allowed to delete this playlist.")
        }
    
        res.render('playlists/delete-form', {user, errorMsg: false, playlist, songsList});
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error calling database.")
    }
}

exports.deletePlaylist = async (req, res) => {
    const {user} = req.session;
    const {playlistID} = req.params;
    const username = req.body.username.trim();
    let declaration = req.body.declaration || [];
    declaration = Array.isArray(declaration)? declaration: [declaration];

    const {playlist, songsList} = await Playlist.getByID(playlistID, true);

    // Three layers of confirmation:
    // 1. Check if declaration is both checked
    if (declaration.length < 2) {
        return res.render('playlists/delete-form', {user, errorMsg: "Please check the boxes to confirm deletion.", playlist, songsList});
    }

    // 2. Check if the username matches
    if (username === user.username) {
        return res.render('playlists/delete-form', {user, errorMsg: "Please enter your username to confirm deletion.", playlist, songsList});
    }

    // 3. Check if the owner matches
    if (!checkOwnership(user, playlist)) {
        return res.status(403).send("You are not allowed to delete this playlist.")
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