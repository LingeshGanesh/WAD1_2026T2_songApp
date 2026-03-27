const fs = require('fs/promises');
const mongoose = require('mongoose');
const Album = require('../models/albums-model');
const Song = require('../models/songs-model');

exports.showAlbumList = async (req,res) => {
    try {
        const allAlbums = await Album.retrieveAll() || [];
        res.render("albums/show-album-list", {allAlbums});
    } catch(error) {
        console.error(error)
    }
};

exports.albumInfo = async (req,res) => {
    const albumID = req.params.id
    try {
        const album = await Album.findByID(albumID).populate('songs');
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
    const description = req.body.description
    const artist = req.body.artist;
    const year = req.body.year;
    const songs = req.body.songs 

    const songIds = songs.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));

    let newAlbum = {
        title: title,
        yearReleased: year,
        songs: songIds,
        artist: artist,
        description: description
    }
    console.log(title)
    console.log(description)
    console.log(artist)
    console.log(year)
    console.log(songIds);

    if (!title || !description || !artist || !year || !songIds) {
        return res.render("albums/add-album", { result: "", msg: "All fields are required." })
    }

    try {
        let msg = "";
        let result = (await Album.addAlbum(newAlbum)); // create new album
        //console.log("mylog:" +result);

        res.render("albums/add-album", { result: result || null, msg });

    } catch (error) {
        console.error(error);
        let result = "fail";
        let msg = "";

        res.render("albums/add-album", { result, msg });
    }
};

exports.showEditForm = async (req,res) => {
    const albumID = req.params.id;

    try {
        const album = await Album.findByID(albumID)
        res.render("albums/edit-album", {album})
    } catch(error) {
        console.error(error)
    }
};

exports.updateAlbum = async (req,res) => {
    const albumID = req.params.id; 
    const { title, artist, description, year, songs } = req.body;

    const songIds = songs.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));

    try {
        const result = await Album.editAlbum(albumID, title, description, artist, songIds, year);

        res.send(`<h1>Your album has been edited!</h1>
            <a href="/album/${albumID}">View Your Changes</a>
            `)
    } catch(error) {
        console.error(error)
    }
};

exports.getMarkedAlbum = async (req,res) => {
    const albumID = req.params.id;

    try {
        const album = await Album.findByID(albumID).populate('songs');
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