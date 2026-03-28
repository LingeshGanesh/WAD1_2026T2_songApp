const mongoose = require('mongoose');
const { createIndexes } = require('./songs-model');

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'An album must have a title.']
    },
    yearReleased: {
        type: Number,
        required: [true, 'An album must have year of release'],
        validate: {
            validator: function(value) {
                return value.toString().length === 4; //Ensure it's 4 digit number
            },
            message: 'Year must be 4-digit number'
        }
    },
    songs: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Song'
    }],
    description: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Album = mongoose.model('Album', albumSchema, 'albums');

exports.addAlbum = function(newAlbum) {
    return Album.create(newAlbum);
};

exports.retrieveAll = function() {
    return Album.find();
};

exports.findByID = function(albumID) {
    return Album.findOne({ _id: albumID})
}

exports.editAlbum = function(albumID, title, description, songs, yearReleased) {
    return Album.updateOne({_id: albumID}, {title: title,
        description: description,
        songs: songs,
        yearReleased: yearReleased
    });
};

exports.deleteAlbum = function(albumID) {
    return Album.deleteOne({_id: albumID});
};

exports.findByIDAndPopulate = function (albumID) {
    return Album.findOne({ _id: albumID }).populate('songs').populate('createdBy');
};
