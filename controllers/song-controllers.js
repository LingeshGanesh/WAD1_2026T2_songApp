const Song = require('../models/songs-model');
const Playlist = require('../models/playlists-model');

function normalizeSongFields(body) {
    return {
        title: body.title?.trim(),
        artist: body.artist?.trim(),
        album: body.album?.trim() || null,
        genre: body.genre?.trim() || null,
        duration: Number(body.duration),
        youtubeUrl: body.youtubeUrl?.trim() || null
    };
}

function buildFormFields(song = {}) {
    return {
        title: song.title || '',
        artist: song.artist || '',
        album: song.album || '',
        genre: song.genre || '',
        duration: song.duration ?? '',
        youtubeUrl: song.youtubeUrl || ''
    };
}

function validateSong(fields) {
    if (!fields.title) {
        return 'Song title is required.';
    }

    if (!fields.artist) {
        return 'Song artist is required.';
    }

    if (!Number.isFinite(fields.duration) || fields.duration <= 0) {
        return 'Song duration must be a positive number of seconds.';
    }

    return null;
}

exports.browse = async (req, res) => {
    const allSongs = await Song.retrieveAll();
    const importResult = req.query.imported === '1'
        ? {
            insertedCount: Number(req.query.inserted) || 0,
            updatedCount: Number(req.query.updated) || 0,
            totalCount: Number(req.query.total) || 0
        }
        : null;

    res.render('songs/browse', { allSongs, importResult });
};

exports.songInfo = async (req, res) => {
    const song = await Song.getByID(req.params.songID);

    if (!song) {
        return res.status(404).send('Song not found.');
    }

    res.render('songs/song-info', { song });
};

exports.showCreationForm = async (req, res) => {
    res.render('songs/create-form', { error: null, fields: buildFormFields() });
};

exports.create = async (req, res) => {
    const fields = normalizeSongFields(req.body);
    const error = validateSong(fields);

    if (error) {
        return res.status(400).render('songs/create-form', {
            error,
            fields: buildFormFields(fields)
        });
    }

    try {
        const song = await Song.insert(fields);
        res.redirect(`/song/${song._id}`);
    } catch (err) {
        res.status(400).render('songs/create-form', {
            error: err.code === 11000 ? 'That song already exists in the database.' : err.message,
            fields: buildFormFields(fields)
        });
    }
};

exports.showEditForm = async (req, res) => {
    const song = await Song.getByID(req.params.songID);

    if (!song) {
        return res.status(404).send('Song not found.');
    }

    res.render('songs/edit-form', {
        song,
        error: null,
        fields: buildFormFields(song)
    });
};

exports.update = async (req, res) => {
    const { songID } = req.params;
    const fields = normalizeSongFields(req.body);
    const error = validateSong(fields);

    if (error) {
        return res.status(400).render('songs/edit-form', {
            song: { _id: songID },
            error,
            fields: buildFormFields(fields)
        });
    }

    try {
        const song = await Song.updateByID(songID, fields);

        if (!song) {
            return res.status(404).send('Song not found.');
        }

        res.redirect(`/song/${song._id}`);
    } catch (err) {
        res.status(400).render('songs/edit-form', {
            song: { _id: songID },
            error: err.code === 11000 ? 'That song already exists in the database.' : err.message,
            fields: buildFormFields(fields)
        });
    }
};

exports.delete = async (req, res) => {
    const { songID } = req.params;
    const deletedSong = await Song.deleteByID(songID);

    if (!deletedSong) {
        return res.status(404).send('Song not found.');
    }

    await Playlist.removeSongFromAll(songID);
    res.redirect('/song/browse');
};

exports.importSongs = async (req, res) => {
    try {
        const result = await Song.importFromJSON();
        const params = new URLSearchParams({
            imported: '1',
            inserted: String(result.insertedCount),
            updated: String(result.updatedCount),
            total: String(result.totalCount)
        });

        res.redirect(`/song/browse?${params.toString()}`);
    } catch (err) {
        res.status(500).send(`Song import failed: ${err.message}`);
    }
};

exports.search = async (req, res) => {
    const { songID } = req.params;
    const searchedSong = await Song.getByID(songID);

    if (!searchedSong) {
        return res.status(404).json({ message: 'Song not found.' });
    }

    res.json(searchedSong);
};

exports.redirectToYoutube = async (req, res) => {
    const { songID } = req.params;
    const searchedSong = await Song.getByID(songID);

    if (!searchedSong) {
        return res.status(404).send('Song not found.');
    }

    if (!searchedSong.youtubeUrl) {
        return res.status(400).send('This song does not have a YouTube URL yet.');
    }

    res.redirect(searchedSong.youtubeUrl);
};
