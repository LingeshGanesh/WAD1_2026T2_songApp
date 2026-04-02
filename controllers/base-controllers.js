// Import Models
const User = require("../models/users-model");
const Song = require("../models/songs-model");
const Playlist = require("../models/playlists-model");

// Controllers
exports.guestpage = async (req, res) => {
    const {user} = req.session;
    if (user) {
        return res.redirect("/home");
    }
    try {
        const stats = {
            user: await User.retrieveAll(),
            song: await Song.retrieveAll(),
            playlist: await Playlist.retrievePublic()
        }
        res.render("home-guest", {stats});
    } catch (error) {
        console.error(error);
        return statusPage.renderISE(res, "Error calling database.");
    }
    
}

exports.homepage = (req, res) => {
    const {user} = req.session;
    res.render("home-user", {user});
}