const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

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

Song.retrieveAll = async function() {
    return Song.find().sort({ artist: 1, title: 1 });
};

Song.getByID = async function(id) {
    return Song.findById(id);
};

Song.insert = async function(newSong) {
    return Song.create(newSong);
};

Song.updateByID = async function(id, newValues) {
    return Song.findByIdAndUpdate(id, newValues, {
        new: true,
        runValidators: true
    });
};

Song.deleteByID = async function(id) {
    return Song.findByIdAndDelete(id);
};

Song.importFromJSON = async function(filePath = path.join(__dirname, '..', 'data', 'songs.json')) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const songs = JSON.parse(fileContent);

    if (!Array.isArray(songs) || songs.length === 0) {
        return { insertedCount: 0, updatedCount: 0, totalCount: 0 };
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const song of songs) {
        const existingSong = await Song.findOne({
            title: song.title,
            artist: song.artist,
            album: song.album || null
        });

        if (existingSong) {
            existingSong.genre = song.genre;
            existingSong.duration = song.duration;
            existingSong.youtubeUrl = song.youtubeUrl;
            await existingSong.save();
            updatedCount++;
            continue;
        }

        await Song.create(song);
        insertedCount++;
    }

    return {
        insertedCount,
        updatedCount,
        totalCount: songs.length
    };
};

module.exports = Song;
