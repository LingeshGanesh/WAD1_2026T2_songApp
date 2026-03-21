const mongoose = require('mongoose');

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
    isPublic: {
        type: Boolean,
        default: true
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

// module.exports = Playlist;

exports.retrieveAll = async function() {
    return await Playlist.find();
}

exports.retrievePublic = async function() {
    return await Playlist.find({isPublic: true});
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