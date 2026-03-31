const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    // Adding uploader field to track who uploaded the song, which can be used for authorization in delete/edit operations
    uploader: {
        type: String,
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

const Song = mongoose.model('Song', songSchema, 'songs');

// Mongoose static methods for CRUD operations
// Used in browse page to load all songs from the database
Song.retrieveAll = function () {
    return Song.find();
};

// Used in edit form 
// Used in delete confirmation page to check if song exists before allowing delete
Song.findByID = function (songID) {
    return Song.findOne({ _id: songID });
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
    });
};

// Used in delete confirmation page to delete song from the database
Song.deleteSongByID = function (songID) {
    return Song.findByIdAndDelete(songID);
};

//delete many - Carolyn
Song.deleteManyByUploader = function (username) {
    return Song.deleteMany({ uploader: username });
};
// end of delete many

module.exports = Song;
