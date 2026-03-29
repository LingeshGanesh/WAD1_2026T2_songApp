const fs = require('fs/promises');
const mongoose = require('mongoose');
const Album = require('../models/albums-model');
const Song = require('../models/songs-model');

exports.showAlbumList = async (req,res) => {
    try {
        const allAlbums = await Album.retrieveAll().populate('createdBy') || [];
        res.render("albums/show-album-list", {allAlbums});
    } catch(error) {
        console.error(error)
    }
};

exports.albumInfo = async (req,res) => {
    const albumID = req.params.id
    try {
        const album = await Album.findByID(albumID).populate('songs').populate('createdBy');
        res.render("albums/show-album-created", {album})
    } catch(error) {
        console.error(error)
    }
};

exports.showAddForm = async (req,res) => {
    try {
        res.render("albums/add-album", {result: "", msg: ""})
    } catch (error) {
        console.error(error)
    }
};

exports.createAlbum = async (req,res) => {
    const title = req.body.title;
    const description = req.body.description.trim();
    const year = req.body.year;
    const songs = req.body.songs 

    console.log(req.session.user.id);


    if (year.toString().length !== 4) {
        return res.render("albums/add-album", {msg: "Year must be a 4-digit number." });
    }

    if (!songs) {
        return res.render("albums/add-album", {msg: "Please add at least one song." });
    }

    const songIds = songs.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));

    let newAlbum = {
        title: title,
        yearReleased: year,
        songs: songIds,
        createdBy: req.session.user.id,
        description: description
    }

    try {
        let msg = "";
        let result = await Album.addAlbum(newAlbum);
        const newId = result._id;
        await result.populate('songs');
        await result.populate('createdBy');
        res.redirect(`/album/${newId}`);



    } catch (error) {
        console.error(error);
        let result = "fail";
        let msg = error;

        res.render("albums/add-album", { result, msg });
    }
};

exports.showEditForm = async (req, res) => {
    const albumID = req.params.id;
    try {
        const album = await Album.findByIDAndPopulate(albumID);
        res.render("albums/edit-album", { album, msg: "" }); // add msg: ""
    } catch (error) {
        console.error(error);
    }
};

exports.updateAlbum = async (req, res) => {
    const albumID = req.params.id;

    const title = req.body.title;
    const description = req.body.description.trim();
    const year = req.body.year;
    const songs = req.body.songs;

    if (!title || !year) {
        const album = await Album.findByIDAndPopulate(albumID);
        return res.render("albums/edit-album", { album, msg: "All fields are required." });
    }

    if (!songs){
        const album = await Album.findByIDAndPopulate(albumID);
        return res.render("albums/edit-album", { album, msg: "Please add at least one song." });
    }

    if (year.toString().length !== 4) {
        const album = await Album.findByIDAndPopulate(albumID);
        return res.render("albums/edit-album", {album, msg: "Year must be 4 digits"})
    }

    const songIds = songs.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));

    try {
        await Album.editAlbum(albumID, title, description,songIds, year);
        res.send(`<h1>Your album has been edited!</h1>
            <a href="/album/${albumID}">View Your Changes</a>`);
    } catch (error) {
        console.error(error);
        const album = await Album.findByIDAndPopulate(albumID);
        res.render("albums/edit-album", { album, msg: "Error updating album." });
    }
};

exports.getMarkedAlbum = async (req,res) => {
    const albumID = req.params.id;

    try {
        const album = await Album.findByID(albumID).populate('songs').populate('createdBy');
        res.render("albums/show-album-delete", {album})
    } catch(error) {
        console.error(error)
    }
};

exports.deleteAlbum = async (req,res) => {
    const albumID = req.params.id;

    try {
        let success = await Album.deleteAlbum(albumID);

        if (success.deletedCount===1){
            res.send(`<h1>Album has been successfully deleted.</h1><br>
                <a href="/album/browse"><strong>View Your Changes</strong></a>
                `)
        }
    } catch(error) {
        console.error(error);
    }
};

exports.searchSongs = async (req, res) => {
    const songs = await Song.find({
        title: { $regex: req.query.q, $options: 'i' }
    }).select('_id title artist').limit(10);
    res.json(songs);
};