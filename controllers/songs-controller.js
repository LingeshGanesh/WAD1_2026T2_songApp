const mongoose = require("mongoose");
const Song = require("../models/songs-model");

// Controllers
// Helper function for normalizing and formating song fields from form data
function normalizeSongFields(body) {
    return {
        uploader: (body.uploader || "").trim(),
        title: (body.title || "").trim(),
        artist: (body.artist || "").trim(),
        album: (body.album || "").trim(),
        genre: (body.genre || "").trim(),
        duration: Number(body.duration),
        youtubeUrl: (body.youtubeUrl || "").trim()
    };
}

// Helper functions for validating and building song data
function buildSongPayload(fields) {
    return {
        uploader: fields.uploader,
        title: fields.title,
        artist: fields.artist,
        album: fields.album || null,
        genre: fields.genre || null,
        duration: fields.duration,
        youtubeUrl: fields.youtubeUrl || null
    };
}

// Validation rules for song fields
function validateSong(fields) {
    // Required fields: uploader, title, artist
    if (!fields.uploader || !fields.title || !fields.artist) {
        return "Uploader, title, and artist are required.";
    }
    // Duration must be a positive number
    if (!Number.isFinite(fields.duration) || fields.duration <= 0) {
        return "Duration must be a positive number of seconds.";
    }
    return null;
}

// Convert duration in seconds to M:SS format for display
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Browse all songs
exports.browse = async (req, res) => {
    try {
        // For simplicity, we are not implementing sorting and filtering in this function, but it can be added later by parsing query parameters from req.query
        const songs = await Song.find().sort({ artist: 1, title: 1 });
        res.render("songs/browse", { songs, formatDuration });
    } catch (error) {
        // Log the error and show a generic error message to the user
        console.error(error);
        res.status(500).send("Error loading songs from the database.");
    }
};

// Show form to create new song
exports.showCreationForm = (req, res) => {
    res.render("songs/create-form", {
        // No need to show uploader field in form if user authentication is implemented and uploader is taken from session
        error: null,
        fields: {
            uploader: "",
            title: "",
            artist: "",
            album: "",
            genre: "",
            duration: "",
            youtubeUrl: ""
        }
    });
};

// Create new song
exports.createSong = async (req, res) => {
    const fields = normalizeSongFields(req.body);
    const validationError = validateSong(fields);

    // If validation fails, re-render form with error message and previously entered values
    if (validationError) {
        return res.status(400).render("songs/create-form", { error: validationError, fields });
    }

    // If validation succeeds, attempt to create new song in the database
    try {
        const song = await Song.create(buildSongPayload(fields));
        res.redirect(`/songs/${song._id}`);
    } catch (error) {
        console.error(error);
        const message = error && error.code === 11000
        // Duplicate key error, likely due to unique index on combination of title, artist, and album
            ? "That song already exists in the database."
            : "Error saving song to the database.";
        res.status(500).render("songs/create-form", { error: message, fields });
    }
};

// Browse songs with sorting and filtering
exports.songInfo = async (req, res) => {
    const { songID } = req.params;

    if (!mongoose.isValidObjectId(songID)) {
        return res.status(404).render("not-found", { url: req.url });
    }

    try {
        const song = await Song.findById(songID);

        if (!song) {
            return res.status(404).render("not-found", { url: req.url });
        }

        res.render("songs/song-info", { song, formatDuration });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading song from the database.");
    }
};

// Show form to edit existing song
exports.showEditForm = async (req, res) => {
    const { songID } = req.params;

    // Validate songID format
    if (!mongoose.isValidObjectId(songID)) {
        return res.status(404).render("not-found", { url: req.url });
    }
    // Load song data from the database
    try {
        const song = await Song.findById(songID);
        // If song not found, show 404 page
        if (!song) {
            return res.status(404).render("not-found", { url: req.url });
        }
        // Render edit form with existing song data
        res.render("songs/edit-form", { error: null, song });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading song for editing.");
    }
};

// Update existing song
exports.updateSong = async (req, res) => {
    const { songID } = req.params;
    const fields = normalizeSongFields(req.body);
    const validationError = validateSong(fields);

    // Validate songID format
    if (!mongoose.isValidObjectId(songID)) {
        return res.status(404).render("not-found", { url: req.url });
    }
    // If validation fails, re-render form with error message and previously entered values
    if (validationError) {
        return res.status(400).render("songs/edit-form", {
            error: validationError,
            song: { _id: songID, ...fields }
        });
    }
    // If validation succeeds, attempt to update song in the database
    try {
        const updatedSong = await Song.findByIdAndUpdate(songID, buildSongPayload(fields), {
            new: true,
            runValidators: true
        });

        if (!updatedSong) {
            return res.status(404).render("not-found", { url: req.url });
        }

        res.redirect(`/songs/${updatedSong._id}`);
    } catch (error) {
        console.error(error);
        const message = error && error.code === 11000
            ? "Another song with the same title, artist, and album already exists."
            : "Error updating song in the database.";
        res.status(500).render("songs/edit-form", {
            error: message,
            song: { _id: songID, ...fields }
        });
    }
};

// Show form to confirm deletion of song and handle deletion
exports.showDeleteForm = async (req, res) => {
    const { songID } = req.params;
    // Validate songID format
    if (!mongoose.isValidObjectId(songID)) {
        return res.status(404).render("not-found", { url: req.url });
    }
    // Load song data from the database
    try {
        const song = await Song.findById(songID);
        // If song not found, show 404 page
        if (!song) {
            return res.status(404).render("not-found", { url: req.url });
        }
        // Render delete confirmation form with song data
        res.render("songs/delete-form", { error: null, song, formatDuration });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading song for deletion.");
    }
};

// Delete song after confirmation
exports.deleteSong = async (req, res) => {
    const { songID } = req.params;
    const confirmation = req.body.confirmation;
    const uploader = (req.body.uploader || "").trim();

    if (!mongoose.isValidObjectId(songID)) {
        return res.status(404).render("not-found", { url: req.url });
    }

    try {
        const song = await Song.findById(songID);
        // If song not found, show 404 page
        if (!song) {
            return res.status(404).render("not-found", { url: req.url });
        }
        // Only allow deletion if uploader matches and confirmation text is correct
        if (uploader !== song.uploader) {
            return res.status(403).render("songs/delete-form", {
                error: "Only the original uploader can delete this song.",
                song,
                formatDuration
            });
        }
        // Confirmation text must be exactly "DELETE" to prevent accidental deletions
        if (confirmation !== "DELETE") {
            return res.status(400).render("songs/delete-form", {
                error: 'Type "DELETE" to confirm song deletion.',
                song,
                formatDuration
            });
        }
        // If validation passes, delete the song from the database
        await Song.findByIdAndDelete(songID);
        res.redirect("/songs/browse");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting song from the database.");
    }
};
