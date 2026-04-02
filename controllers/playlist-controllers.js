// Import
const mongoose = require('mongoose');
const Playlist = require("../models/playlists-model");
const statusPage = require('../modules/status-page');

// Private Method
function checkOwnership(user, playlist) {
    return (playlist.owner && user.id === playlist.owner._id.toString());
}

function comparePlaylist(a, b, sortby, isAscending) {
    let comp;
    if (sortby === 'name') {
        comp = (a.name > b.name)? 1: -1;
    } else {
        comp = a.creationDate - b.creationDate;
    }
    return comp * (isAscending? 1: -1);
}

function convertTime(timeSec) {
    const minute = Math.floor(timeSec / 60);
    const second = timeSec % 60;

    return `${minute}:${second.toString().padStart(2, "0")}`;
}

// Controllers
// Read
exports.browse = async (req, res) => {
    // Get sorting fields
    let {sortby, isAscending} = req.query;
    sortby = sortby || 'creationDate';
    isAscending = (isAscending === 'true') || false;

    // Get all public playlist
    let allPlaylists;
    try {
        allPlaylists = await Playlist.retrievePublic();
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error fetching playlists from database.");
    }

    // Sort the playlists by the sorting fields
    allPlaylists.sort((a, b) => comparePlaylist(a, b, sortby, isAscending));

    // Render page
    const option = {
        allPlaylists,
        sortby, 
        isAscending, 
        subroute: "browse"};

    res.render('playlists/browse', option);
};

exports.playlistInfo = async (req, res) => {
    const {playlistID} = req.params;
    const {user} = req.session;

    // The given playlistID is not a valid ID.
    if (!mongoose.isValidObjectId(playlistID)) {
        return res.status(404).render("status/not-found", {url: req.url});
    }
    
    try {
        let playlist = await Playlist.getByID(playlistID, true);
        console.log(playlist);
        // If the playlist does not exist, show playlist not found page
        if (!playlist) {
            return res.status(404).render('playlists/not-found');
        }
        
        // If non-owner is accessing private playlist, show not found page
        const isOwner = checkOwnership(user, playlist);
        if (playlist.visibility === 'Private' && !isOwner) {
            return res.status(404).render('playlists/not-found');
        }

        // Get songs and playlist duration
        songsDuration = [];
        playlistDuration = 0;
        for (let i = 0; i < playlist.songs.length; i++) {
            const eachSong = playlist.songs[i]
            songsDuration.push(convertTime(eachSong.duration));
            playlistDuration += eachSong.duration;
        }

        // Render page
        const option = {
            isOwner, // true if the current user is the owner of this playlist.
            playlist, // playlist document
            songsDuration, // array of song durations
            playlistDuration // total playlist durations
        }

        res.render('playlists/playlist-info', option);
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error calling database.");
    }
};

exports.yourPlaylists = async (req, res) => {
    // Get all sorting fields (and client info from session)
    const {user} = req.session;
    let {sortby, isAscending} = req.query;
    sortby = sortby || 'creationDate'
    isAscending = (isAscending === 'true') || false;

    // Get the client's playlists
    let allPlaylists;
    try {
        allPlaylists = await Playlist.retrieveByOwnerID(user.id);
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error calling database.");
    }

    // Sort the playlists by the sorting fields
    allPlaylists.sort((a, b) => comparePlaylist(a, b, sortby, isAscending));

    // all playlist is owned by one user, set "owners" to that user.
    let owners = user.username;
    
    // Render page
    const option = {
        allPlaylists, 
        owners, 
        sortby, 
        isAscending, 
        subroute: "yours"};

    res.render('playlists/browse', option);
};

exports.randomPlaylist = async (req, res) => {
    try {
        const allPlaylists = await Playlist.retrievePublic();

        if (!allPlaylists) {return res.status(404).render("playlists/not-found")}

        // Get a random index value
        const i = (Math.floor(Math.random() * allPlaylists.length) % allPlaylists.length);
    
        // Redirect to a random page
        return res.status(200).redirect(`/playlist/${allPlaylists[i]._id}`);
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error calling database.");
    }
}

// Create
exports.showCreationForm = async (req, res) => {
    res.render('playlists/create-form', {error: false});
}

exports.createPlaylist = async (req, res) => {
    // Get all input fields
    const {user} = req.session;
    let { name, description, visibility, songs } = req.body;
    let thumbnail = req.file;

    // Input Normalization & Validation
    name = name.trim();
    description = description.trim();
    description = description === ""? null : description;
    
    // There is no song.
    if (songs === "") {
        return res.render('playlists/create-form', {
            user, 
            fields: {name, description, thumbnail, visibility, songs}, 
            error: true 
        });
    }

    // There are songs.
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

        // Add the thumbnail into the entry
        if (thumbnail) {
            await Playlist.addThumbnail(playlistID, thumbnail);
        }
    
        // Show success page
        res.render('playlists/create-success', {playlist: playlistDoc});
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error calling database.");
    }
}

// Update
exports.showEditForm = async (req, res) => {
    const {user} = req.session;
    const {playlistID} = req.params;

    try {
        // Fetch the playlist info
        let playlist = await Playlist.getByID(playlistID, true);

        // If the playlist does not exist, show playlist not found page
        if (!playlist) {
            return res.status(404).render('playlists/not-found');
        }
        
        // Only allow the owner to edit (Authorization)
        if (!checkOwnership(user, playlist)) {
            return statusPage.renderForbidden(res, "You are not allowed to edit this playlist.");
        }
        
        // Render page
        const option = {
            error: false, 
            playlist
        }

        res.render('playlists/edit-form', option);
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error calling database.");
    }
}

exports.updatePlaylist = async (req, res) => {
    // Get all input fields
    const {user} = req.session;
    const {playlistID} = req.params;
    let { name, description, editThumb, visibility, songs } = req.body;
    let thumbnail = req.file;

    // Input Normalization & Validation
    name = name.trim();
    description = description.trim();
    description = description === ""? null : description;
    editThumb = (editThumb === "true");
    
    // There is no song.
    if (songs === "") {
        return res.render('playlists/edit-form', {
            user, 
            fields: {name, description, visibility, songs}, 
            error: true 
        });
    }
    // There are songs.
    songs = songs.split(",");

    // Insert into the database
    try {
        // Only allow the owner to edit (Authorization)
        const playlist = await Playlist.getByID(playlistID, false);
        if (!checkOwnership(user, playlist)) {
            return statusPage.renderForbidden(res, "You are not allowed to edit this playlist.");
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
                await Playlist.removeThumbnail(playlistID);
            }
        }
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error calling database.");
    }

    // Render success page
    res.render('playlists/edit-success', {playlist: {name, _id: playlistID}});
}

// Delete
exports.showDeleteForm = async (req, res) => {
    const {user} = req.session;
    const {playlistID} = req.params;

    try {
        let playlist = await Playlist.getByID(playlistID, true);
        
        // If the playlist does not exist, show playlist not found page
        if (!playlist) {
            return res.status(404).render('playlists/not-found');
        }

        // Only allow the owner to delete (Authorization)
        if (!checkOwnership(user, playlist)) {
            return statusPage.renderForbidden(res, "You are not allowed to delete this playlist.");
        }
        
        // Render form
        res.render('playlists/delete-form', {user, errorMsgs: false, playlist});
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error calling database.");
    }
}

exports.deletePlaylist = async (req, res) => {
    // Get all fields
    const {user} = req.session;
    const {playlistID} = req.params;
    const username = req.body.username.trim();
    let declaration = req.body.declaration || [];
    declaration = Array.isArray(declaration)? declaration: [declaration];

    // Fetch playlist info
    let playlist = await Playlist.getByID(playlistID, true);

    // Three layers of confirmation:
    let errorMsgs = [];
    // 1. Check if declaration is both checked
    if (declaration.length < 2) {
        errorMsgs.push("Please check the boxes to confirm deletion.");
    }

    // 2. Check if the username matches
    if (username !== user.username) {
        errorMsgs.push("Please enter your username to confirm deletion.")
    }
    
    // 3. Check if the owner matches
    if (!checkOwnership(user, playlist)) {
        return statusPage.renderForbidden(res, "You are not allowed to delete this playlist.");
    }

    // If there are errors, return to the form.
    if (errorMsgs.length > 0) {
        return res.render('playlists/delete-form', {user, errorMsgs, playlist});
    }

    // Delete playlist
    try {
        await Playlist.removeThumbnail(playlistID);
        await Playlist.deleteByID(playlistID);
        res.render("playlists/delete-success");
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error deleting playlist from the database.");
    }
}