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
    },
    likes: {
        type: Number,
        default: 0
    }
});

const Song = mongoose.model('Song', songSchema, 'songs');

module.exports = Song;