const fs = require('fs/promises');
const mongoose = require('mongoose');
const Album = require('../models/albums-model');
const Song = require('../models/songs-model');

exports.showAlbumList = async (req, res) => {
    try {
        // populate allows each key-value pairs data to be fetched
        const allAlbums = await Album.retrieveAll().populate('createdBy') || [];
        res.render("albums/show-album-list", { allAlbums });
    } catch (error) {
        console.error(error)
    }
};

exports.albumInfo = async (req, res) => {
    const albumID = req.params.id // extracts album ID from url, req.params.id returns the objectID
    // if /album/123456789, req.params.id returns '123456789' stored in albumID to find specific album in the database

    function renderAlbumNotFound(req, res) {
        return res.status(404).render("status/not-found", {
            url: req.url,
            user: req.user || req.session?.user || null
        });
    }

    if (!mongoose.isValidObjectId(albumID)) {
        return renderAlbumNotFound(req, res)
    }
    try {
        // populate to get song and creator details
        const album = await Album.findByID(albumID).populate('songs').populate('createdBy');
        res.render("albums/show-album-created", { album })
    } catch (error) {
        console.error(error)
    }
};

exports.showAddForm = async (req, res) => {
    try {
        res.render("albums/add-album", { msg: "" })
    } catch (error) {
        console.error(error)
    }
};

exports.createAlbum = async (req, res) => {
    const title = req.body.title;
    const description = req.body.description.trim();
    const year = req.body.year;
    const songs = req.body.songs

    const currentYear = new Date().getFullYear();

    if (year.toString().length !== 4) {
        return res.render("albums/add-album", { result: "", msg: "Year must be a 4-digit number." });
    }

    if (year < 1900) {
        return res.render("albums/add-album", { result: "", msg: "Year must be after 1900." });
    }

    if (year > currentYear) {
        return res.render("albums/add-album", { result: "", msg: `Year cannot be after ${currentYear}.` });
    }

    if (!songs) { // validation for song field
        return res.render("albums/add-album", { msg: "Please add at least one song." });
    }

    // split comma separated songIDs into array of strings
    // .map(id=> ...) loops over each string, trims any whitespace and converts the string 
    // into a proper MongoDB ObjectId object 
    const songIds = songs.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));

    let newAlbum = {
        title: title,
        yearReleased: year,
        songs: songIds,
        createdBy: req.session.user.id, // saves the user who created the album for authorization purposes
        description: description
    }

    try {
        let result = await Album.addAlbum(newAlbum);
        const newId = result._id;

        //Song.updateMany(...) runs update on all documents that match the filter
        // _id: { $in: songIds} is the filter. $in is a MongoDB operator that 
        // matches any document whose _id is in the songIds array.
        await Song.updateMany(
            { _id: { $in: songIds } },
            { album: newId }
        );
        await result.populate('songs');
        await result.populate('createdBy');
        res.redirect(`/album/${newId}`);

    } catch (error) {
        console.error(error);
        let msg = error;

        res.render("albums/add-album", { msg });
    }
};

exports.showEditForm = async (req, res) => {
    const albumID = req.params.id;

    function renderAlbumNotFound(req, res) {
        return res.status(404).render("status/not-found", {
            url: req.url,
            user: req.user || req.session?.user || null
        });
    }

    if (!mongoose.isValidObjectId(albumID)) {
        return renderAlbumNotFound(req, res)
    }
    try {
        const album = await Album.findByIDAndPopulate(albumID);
        if (album.createdBy._id.toString() !== req.session.user.id) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="/css/album-dark.css">
                </head>
                <body>
                    <h1>You do not have permission to access this.</h1>
                    <a href="/album/browse">Go back</a>
                </body>
                </html>
            `);
        }

        res.render("albums/edit-album", { album, msg: "" }); // add msg: ""
    } catch (error) {
        console.error(error);
    }
};

exports.updateAlbum = async (req, res) => {
    const albumID = req.params.id;
    const album = await Album.findByIDAndPopulate(albumID);

    // Helper function to render a 404 not found page for songs
    // INPUT: req and res objects from Express route handlers
    // OUTPUT: Rendered 404 not found page with the requested URL and user information if available
    function renderAlbumNotFound(req, res) {
        return res.status(404).render("status/not-found", {
            url: req.url,
            user: req.user || req.session?.user || null
    });
    }

    if (!mongoose.isValidObjectId(albumID)) {
        return renderAlbumNotFound(req,res)
    }

    if (album.createdBy._id.toString() !== req.session.user.id) {
        return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="/css/album-dark.css">
                </head>
                <body>
                    <h1>You do not have permission to access this.</h1>
                    <a href="/album/browse">Go back</a>
                </body>
                </html>
            `);
    }

    const title = req.body.title;
    const description = req.body.description.trim();
    const year = req.body.year;
    const songs = req.body.songs;

    const currentYear = new Date().getFullYear();


    if (!title || !year) {
        const album = await Album.findByIDAndPopulate(albumID);
        return res.render("albums/edit-album", { album, msg: "All fields are required." });
    }

    if (!songs) {
        const album = await Album.findByIDAndPopulate(albumID);
        return res.render("albums/edit-album", { album, msg: "Please add at least one song." });
    }

    if (year.toString().length !== 4) {
        const album = await Album.findByIDAndPopulate(albumID);
        return res.render("albums/edit-album", { album, msg: "Year must be 4 digits" })
    }

    if (year < 1900) {
        const album = await Album.findByIDAndPopulate(albumID);
        return res.render("albums/edit-album", { album, msg: "Year must be after the 1900s" })
    }

    if (year > currentYear) {
        const album = await Album.findByIDAndPopulate(albumID);
        return res.render("albums/edit-album", { album, msg: `Year cannot be after ${currentYear}.` })
    }

    const songIds = songs.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));

    try {
        // extracts the objectIds strings from the current album's songs array
        const previousSongIds = album.songs.map(song => song._id.toString());
        await Album.editAlbum(albumID, title, description, songIds, year);

        //Song.updateMany(...) runs update on all documents that match the filter
        // _id: { $in: songIds} is the filter. $in is a MongoDB operator that 
        // matches any document whose _id is in the songIds array.
        await Song.updateMany(
            { _id: { $in: songIds } },
            { album: albumID }
        );

        await Song.updateMany(
            {
                // Find songs that were previously in the album but are not in the updated song list
                _id: {
                    $in: previousSongIds.filter((songId) => !songIds.some((selectedId) => selectedId.toString() === songId))
                }
            },
            { album: null }
        );

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" href="/css/album-dark.css">
            </head>
            <body>
                <h1>Your album has been edited!</h1>
                <a href="/album/${albumID}">View Your Changes</a>
            </body>
            </html>
            `);
    } catch (error) {
        console.error(error);
        const album = await Album.findByIDAndPopulate(albumID);
        res.render("albums/edit-album", { album, msg: "Error updating album." });
    }
};

exports.getMarkedAlbum = async (req, res) => {
    const albumID = req.params.id;

    function renderAlbumNotFound(req, res) {
        return res.status(404).render("status/not-found", {
            url: req.url,
            user: req.user || req.session?.user || null
        });
    }

    if (!mongoose.isValidObjectId(albumID)) {
        return renderAlbumNotFound(req, res)
    }

    try {
        const album = await Album.findByID(albumID).populate('songs').populate('createdBy');
        if (album.createdBy._id.toString() !== req.session.user.id) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="/css/album-dark.css">
                </head>
                <body>
                    <h1>You do not have permission to access this.</h1>
                    <a href="/album/browse">Go back</a>
                </body>
                </html>
            `);
        }
        res.render("albums/show-album-delete", { album })
    } catch (error) {
        console.error(error)
    }
};

exports.deleteAlbum = async (req, res) => {
    const albumID = req.params.id;

    function renderAlbumNotFound(req, res) {
        return res.status(404).render("status/not-found", {
            url: req.url,
            user: req.user || req.session?.user || null
        });
    }

    if (!mongoose.isValidObjectId(albumID)) {
        return renderAlbumNotFound(req, res)
    }

    try {
        const album = await Album.findByID(albumID);
        if (album.createdBy.toString() !== req.session.user.id) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="/css/album-dark.css">
                </head>
                <body>
                    <h1>You do not have permission to access this.</h1>
                    <a href="/album/browse">Go back</a>
                </body>
                </html>
            `);
        }

        const songIds = album.songs.map(s => s._id ? s._id : s);

        // Clear album title from all songs in this album
        await Song.updateMany(
            { _id: { $in: songIds } },
            { album: null }
        );

        let success = await Album.deleteAlbum(albumID);
        if (success.deletedCount === 1) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="/css/album-dark.css">
                </head>
                <body>
                    <h1>Album has been successfully deleted.</h1>
                    <a href="/album/browse"><strong>Go back to browse</strong></a>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error(error);
    }
};

// Song.find({...}) queries the song collection with 2 conditions: title and uploader
exports.searchSongs = async (req, res) => {
    const songs = await Song.find({
        // req.query.q is the search term for the url eg /album/song-search?q=hi gives q = "hi"
        // $options: 'i' makes it case-insensitive
        title: { $regex: req.query.q, $options: 'i' },
        uploader: req.session.user.id // only the song that uploader added will be returned
    }).select('_id title artist').limit(10); //only the songid, song title and song artist will be returned
    res.json(songs); // sends the result back as JSON objects for EJS to fetch and render as dropdown list
};
