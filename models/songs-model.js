const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A song must have a title']
    },
    artist: {
        type: String,
        required: [true, 'A song must have an artist']
    },
    album: {
        type: String
    },
    genre: {
        type: String
    },
    duration: {
        type: Number
    },
    youtubeUrl: {
        type: String
    }
});

songSchema.index({ title: 1, artist: 1, album: 1 }, { unique: true });

const Song = mongoose.model('Song', songSchema, 'songs');

module.exports = Song;