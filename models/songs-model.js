const mongoose = require('mongoose');

const ALLOWED_GENRES = [
    "Classical",
    "Country",
    "Electronic",
    "Hip-Hop",
    "Indie",
    "Jazz",
    "Pop",
    "Rock"
];

const songSchema = new mongoose.Schema({
    // Adding uploader field to track who uploaded the song, which can be used for authorization in delete/edit operations
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: [true, 'A song must have an uploader']
    },
    title: {
        type: String,
        required: [true, 'A song must have a title']
    },
    artist: {
        type: String,
        required: [true, 'A song must have an artist']
    },
    // Reference Album by ObjectId, null by default
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        default: null
    },
    genre: {
        type: String,
        // Restrict genre to be one of the allowed options defined in ALLOWED_GENRES
        enum: {
            values: ALLOWED_GENRES,
            message: "Genre must be one of the allowed options."
        }
    },
    duration: {
        type: Number,
        required: [true, 'A song must have a duration']
    },
    youtubeUrl: {
        type: String,
        required: [true, 'A song must have a YouTube URL']
    }
});

const Song = mongoose.model('Song', songSchema, 'songs');

// Mongoose static methods for CRUD operations
// Used in browse page to load all songs from the database
// populate uploader field to get the username of the uploader for display in the browse page
// populate album field to get the title of the album for display in the browse page
Song.retrieveAll = function () {
    return Song.find()
        .populate("uploader", "username")
        .populate("album", "title");
};

// Used in edit form 
// Used in delete confirmation page to check if song exists before allowing delete
// populate uploader field to get the username of the uploader for display in the browse page
// popoulate album field to get the title of the album for display in the browse page
Song.findByID = function (songID) {
    return Song.findOne({ _id: songID })
        .populate("uploader", "username")
        .populate("album", "title");
};

// Used in create form to save new song to the database
Song.createSong = function (newSong) {
    return Song.create(newSong);
};

// Used in edit form to update existing song in the database
Song.updateSongByID = function (songID, updatedSong) {
    return Song.findByIdAndUpdate(songID, updatedSong, {
        new: true,
        runValidators: true
    })
        // populate uploader field to get the username of the uploader for display in the browse page
        // populate album field to get the title of the album for display in the browse page
        .populate("uploader", "username")
        .populate("album", "title");
};

// Used in delete confirmation page to delete song from the database
Song.deleteSongByID = function (songID) {
    return Song.findByIdAndDelete(songID);
};

//delete many - Carolyn
Song.deleteManyByUploader = function (userId) {
    return Song.deleteMany({ uploader: userId });
};
// end of delete many

module.exports = Song;
module.exports.ALLOWED_GENRES = ALLOWED_GENRES;
