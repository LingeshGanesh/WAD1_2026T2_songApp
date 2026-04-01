const mongoose = require("mongoose");
const Song = require("../models/songs-model");

// HELPER FUNCTIONS
// Helper function for normalizing and formating song fields from form data
function normalizeSongFields(body) {
    return {
        title: (body.title || "").trim(),
        artist: (body.artist || "").trim(),
        album: (body.album || "").trim(),
        genre: (body.genre || "").trim(),
        duration: Number(body.duration),
        youtubeUrl: (body.youtubeUrl || "").trim()
    };
}

// Helper function for validating song fields
function validateSong(fields) {
    // Required fields: title, artist
    if (!fields.title || !fields.artist) {
        return "Title and artist are required.";
    }
    // Duration must be a positive number
    if (!Number.isFinite(fields.duration) || fields.duration <= 0) {
        return "Duration must be a positive number of seconds.";
    }
    return null;
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

// Helper function to convert duration in seconds to M:SS format for display
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// RENDER FUNCTIONS
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

// Show form to edit existing song
exports.showEditForm = async (req, res) => {
    const { songID } = req.params;

    // Validate songID format
    if (!mongoose.isValidObjectId(songID)) {
        return res.status(404).render("not-found", { url: req.url });
    }
    // Load song data from the database
    try {
        // Check if song exists before rendering edit form
        const song = await Song.findByID(songID);
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

// Show form to confirm deletion of song and handle deletion
exports.showDeleteForm = async (req, res) => {
    const { songID } = req.params;
    // Validate songID format
    if (!mongoose.isValidObjectId(songID)) {
        return res.status(404).render("not-found", { url: req.url });
    }
    // Load song data from the database
    try {
        const song = await Song.findByID(songID);
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

// CRUD FUNCTIONS
// READ: Browse all songs
exports.browse = async (req, res) => {
    try {
        // For simplicity, we are not implementing sorting and filtering in this function, but it can be added later by parsing query parameters from req.query
        const songs = await Song.retrieveAll().sort({ artist: 1, title: 1 });
        res.render("songs/browse-songs", { songs, formatDuration });
    } catch (error) {
        // Log the error and show a generic error message to the user
        console.error(error);
        res.status(500).send("Error loading songs from the database.");
    }
};

// CREATE: Create new song
exports.createSong = async (req, res) => {
    const fields = normalizeSongFields(req.body);
    const validationError = validateSong(fields);
    fields.uploader = req.user._id; // Store the uploader as a User ObjectId reference
    fields.album = ""; // Set album as empty

    // If validation fails, re-render form with error message and previously entered values
    if (validationError) {
        return res.status(400).render("songs/create-form", { error: validationError, fields });
    }

    // If validation succeeds, attempt to create new song in the database
    try {
        const song = await Song.createSong(buildSongPayload(fields));
        res.redirect(`/songs/${song._id}`);
    } catch (error) {
        console.error(error);
        const message = "Error saving song to the database.";
        res.status(500).render("songs/create-form", { error: message, fields });
    }
};

// READ: View details of a specific song
exports.songInfo = async (req, res) => {
    const { songID } = req.params;

    if (!mongoose.isValidObjectId(songID)) {
        return res.status(404).render("not-found", { url: req.url });
    }

    try {
        const song = await Song.findByID(songID);

        if (!song) {
            return res.status(404).render("not-found", { url: req.url });
        }

        res.render("songs/song-info", { song, formatDuration });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading song from the database.");
    }
};

// UPDATE: Update existing song
exports.updateSong = async (req, res) => {
    const { songID } = req.params;
    const fields = normalizeSongFields(req.body);
    const validationError = validateSong(fields);
    const uploader = req.user._id; // Get the user ID of the logged-in user from the session

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
        const existingSong = await Song.findByID(songID);
        if (!existingSong) {
            return res.status(404).render("not-found", { url: req.url });
        }

        // Only allow updates if uploader matches
        if (existingSong.uploader._id.toString() !== uploader.toString()) {
            return res.status(403).render("songs/edit-form", {
                error: "Only the original uploader can edit this song.",
                song: existingSong
            });
        }
        // Preserve the original uploader reference in the updated song data
        fields.uploader = existingSong.uploader._id;
        const updatedSong = await Song.updateSongByID(songID, buildSongPayload(fields));
        // If update is successful, redirect to the song info page
        res.redirect(`/songs/${updatedSong._id}`);
    } catch (error) {
        console.error(error);
        const message = "Error updating song in the database.";
        res.status(500).render("songs/edit-form", {
            error: message,
            song: { _id: songID, ...fields }
        });
    }
};

// Delete song after confirmation
exports.deleteSong = async (req, res) => {
    const { songID } = req.params;
    const confirmation = req.body.confirmation;
    const uploader = req.user._id; // Get the user ID of the logged-in user from the session
    // Validate songID format
    if (!mongoose.isValidObjectId(songID)) {
        return res.status(404).render("not-found", { url: req.url });
    }

    try {
        const song = await Song.findByID(songID);
        // If song not found, show 404 page
        if (!song) {
            return res.status(404).render("not-found", { url: req.url });
        }
        // Only allow deletion if uploader matches and confirmation text is correct
        if (song.uploader._id.toString() !== uploader.toString()) {
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
        await Song.deleteSongByID(songID);
        res.redirect("/songs/browse");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting song from the database.");
    }
};
