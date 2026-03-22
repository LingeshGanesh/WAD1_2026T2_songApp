const mongoose = require('mongoose');
const Song = require('./songs-model');

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A playlist must have a name']
    },
    description: {
        type: String
    },
    genre: {
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

// CRUD Functions
exports.retrieveAll = async function() {
    return await Playlist.find();
}

exports.retrievePublic = async function() {
    return await Playlist.find({visibility: "Public"});
}

exports.getByID = async function(id, loadSong = false) {
    const playlist =  await Playlist.findById(id);
    if (loadSong) {
        let songsList = [];
        let songsDuration = [];
        for (let i = 0; i < playlist.songs.length; i++) {
            const songID = playlist.songs[i]
            // TODO: replace with song's create method
            let eachSong = await Song.findById(songID);
            songsList.push(eachSong);
            songsDuration.push(convertTime(eachSong.duration));
        }
        return {playlist, songsList, songsDuration};
    } else {
        return playlist;
    }
}

exports.insert = async function(newPlaylist) {
    const doc = await Playlist.create(newPlaylist);
    return doc;
}

exports.updateByID = async function(id, newValue) {
    await Playlist.updateOne({_id: id}, newValue)
}