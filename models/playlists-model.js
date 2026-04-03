const mongoose = require('mongoose');

// File System to store thumbnails
const fs = require('fs/promises');
const path = require('path');
const thumbnailDir = path.join(__dirname, "../public/image/playlist-thumb");

// Set the thumbnail directory if it does not exist during setup
if (!require("fs").existsSync(path.join(thumbnailDir))) {
    fs.mkdir(thumbnailDir);
}

// Schema
const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A playlist must have a name']
    },
    description: {
        type: String
    },
    thumbnail: {
        type: mongoose.Schema.Types.Buffer
    },
    visibility: {
        type: String,
        default: "Private",
        enum: ["Private", "Unlisted", "Public"]
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


// Create thumbnails from each playlistDocs
Playlist.find({thumbnail: {$exists: true}}).then(docs => {
    for (let doc of docs) {
        if (doc.thumbnail) {
            fs.writeFile(path.join(thumbnailDir, `${doc._id}.jpeg`), doc.thumbnail);
        }
    }
});


// CRUD Functions
// Read
exports.retrieveAll = async function() {
    return await Playlist.find().populate('owner');
}

exports.retrievePublic = async function() {
    return await Playlist.find({visibility: "Public"}).populate('owner');
}

exports.retrieveByOwnerID = async function(ownerID) {
    return await Playlist.find({owner: ownerID});
}

exports.getByID = async function(id, loadSong) {
    const playlist = Playlist.findById(id);
    
    if (loadSong) {
        return await playlist.populate(["owner", "songs"]);
    } else {
        return await playlist.populate(["owner"]);
    }
}

exports.searchPublicPlaylists = function (query) {
    //https://stackoverflow.com/questions/76149327/how-to-solve-redos-pointed-out-by-snyk
    //all special regular expression characters escaped
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return Playlist.find({
        //https://www.mongodb.com/docs/manual/reference/operator/query/regex/
        // i matches lower or uppercase
        name: { $regex: escapedQuery, $options: 'i' },
        visibility: "Public"
    }).populate("owner").limit(10);
}

// Create
exports.insert = async function(newPlaylist) {
    const doc = await Playlist.create(newPlaylist);
    return doc;
}

exports.addThumbnail = async function(playlistID, imageBuffer) {
    await fs.writeFile(path.join(thumbnailDir, `${playlistID}.jpeg`), imageBuffer);
    await exports.updateByID(playlistID, {thumbnail: imageBuffer});
}

// Update
exports.updateByID = async function(id, newValue) {
    await Playlist.updateOne({_id: id}, newValue)
}

// Delete
exports.removeThumbnail = async function(playlistID) {
    const playlistObj = await Playlist.findById(playlistID);
    const thumbnail = playlistObj.thumbnail;
    await exports.updateByID(playlistID, {thumbnail: null});
    if (thumbnail) {
        const filename = `${playlistID}.jpeg`;
        await fs.rm(path.join(thumbnailDir, filename));
    }
}
    
exports.deleteByID = async function(id) {
    await Playlist.deleteOne({_id: id});
}

//Carolyn
exports.retrievePublicByOwnerID = async function(ownerID) {
    return await Playlist.find({
        owner: ownerID,
        visibility: 'Public'
    });
}

exports.deleteManyByOwnerId = async function (ownerId) {
    return await Playlist.deleteMany({ owner: ownerId });
};