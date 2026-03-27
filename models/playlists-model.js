const mongoose = require('mongoose');
const Song = require('./songs-model');

// File System to store thumbnails
const fs = require('fs/promises');
const path = require('path');
const thumbnailDir = path.join(__dirname, "../public/image/playlist-thumb");

// Set the directory if it does not exist during setup
if (!fileExists(".")) {fs.mkdir(thumbnailDir);}

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A playlist must have a name']
    },
    description: {
        type: String
    },
    thumbnailExt: {
        type: String
    },
    visibility: {
        type: String,
        default: "Private"
    },
    creationDate: {
        type: Date,
        default: Date.now()
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }]
});

const Playlist = mongoose.model('Playlist', playlistSchema, 'playlists');

// Private Functions
function convertTime(timeSec) {
    const minute = Math.floor(timeSec / 60);
    const second = timeSec % 60;

    return `${minute}:${second.toString().padStart(2, "0")}`;
}

function fileExists(filepath) {
    return require("fs").existsSync(path.join(thumbnailDir, filepath));
}

// CRUD Functions
exports.retrieveAll = async function() {
    return await Playlist.find();
}

exports.retrievePublic = async function() {
    return await Playlist.find({visibility: "Public"});
}

exports.retrieveByOwnerID = async function(ownerID) {
    return await Playlist.find({owner: ownerID});
}

exports.getByID = async function(id, loadSong = false) {
    const playlist =  await Playlist.findById(id);
    // The playlist returned is either null or not.
    
    if (loadSong) {
        // Return early if no playlist is found.
        if (!playlist) {return {playlist};}

        // Query songs from the database
        let songLUT = new Map();
        for (const songID of playlist.songs) {
            if (!songLUT.has(songID.toString())) {
                // TODO: replace with song's create method
                let eachSong = await Song.findById(songID);
                songLUT.set(songID.toString(), eachSong);
                console.log(`Queried: ${eachSong.title}`);
            }
        }

        // Fill songsList
        let songsList = [];
        let songsDuration = [];
        let playlistDuration = 0;
        for (let i = 0; i < playlist.songs.length; i++) {
            const songID = playlist.songs[i];
            const eachSong = songLUT.get(songID.toString());
            songsList.push(eachSong);
            songsDuration.push(convertTime(eachSong.duration));
            playlistDuration += eachSong.duration;
        }
        return {playlist, songsList, songsDuration, playlistDuration};
    } else {
        return playlist;
    }
}

exports.insert = async function(newPlaylist) {
    const doc = await Playlist.create(newPlaylist);
    return doc;
}

exports.addThumbnail = async function(playlistID, fileobject) {
    await exports.updateByID(playlistID, {thumbnailExt: path.extname(fileobject.originalname)})
    let filename = fileobject.originalname;
    let imagefile = fileobject.buffer;
    await fs.writeFile(path.join(thumbnailDir, `${playlistID}${path.extname(filename)}`), imagefile);
}

exports.removeThumbnail = async function(playlistID) {
    const playlistObj = await Playlist.findById(playlistID);
    const thumbnailExt = playlistObj.thumbnailExt;
    await exports.updateByID(playlistID, {thumbnailExt: null});
    if (thumbnailExt) {
        const filename = `${playlistID}${thumbnailExt}`;
        await fs.rm(path.join(thumbnailDir, filename));
    }
}

exports.updateByID = async function(id, newValue) {
    await Playlist.updateOne({_id: id}, newValue)
}

exports.deleteByID = async function(id) {
    await Playlist.deleteOne({_id: id});
}