// Run the other scripts before running this script
// Constants
const totalPlaylistNum = 30;

// Import
const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Playlist = require("../models/playlists-model");
const User = require("../models/users-model");
const Song = require("../models/songs-model");

dotenv.config({ path: path.join(__dirname, "../config.env") });

// Private Function
function randomVis() {
    const randScore = Math.random();
    if (randScore < 0.7) {
        return "Public";
    } else if (randScore < 0.9) {
        return "Unlisted";
    } else {
        return "Private";
    }
}

function randomTime() {
    const timeOffset = Math.random() * 30 * 24 * 3600 * 1000;
    return Date.now() - timeOffset;
}

function randomUser(users) {
    const randScore = Math.floor(Math.random() * users.length % users.length);
    return users[randScore];
}

function randomSongs(songs) {
    let plistSong = [];
    let totalSongs = randomTotal();
    while (plistSong.length < totalSongs) {
        const randScore = Math.floor(Math.random() * songs.length % songs.length);
        plistSong.push(songs[randScore]._id);
    }
    return plistSong;
}

function randomTotal() {
    let score = 1
    for (let i = 0; i < 14; i++) {
        score += Math.random();
    }
    return Math.round(score);
}

// Main Function
async function run() {
    try {
        await mongoose.connect(process.env.DB);

        // Get all users and songs
        const allUsers = await User.retrieveAll();
        const allSongs = await Song.retrieveAll();

        for (let i = 0; i < totalPlaylistNum; i++) {
            // playlist
            const name = fetch("https://random-words-api.kushcreates.com/api?language=en&words=2").then(x => x.json()).then(y => [y[0].word, y[1].word].join(" "));
            const desc = fetch("https://api.adviceslip.com/advice").then(x => x.json()).then(y => y.slip.advice);
            const plistObj = {
                name: await name,
                description: await desc,
                visibility: randomVis(),
                creationDate: randomTime(),
                owner: randomUser(allUsers)._id,
                songs: randomSongs(allSongs)
            }
            const doc = Playlist.insert(plistObj).then(doc => {
                // Assign Thumbnail
                fetch("https://cataas.com/cat").then(x => x.blob()).then(async blob => {
                    const fileobject = {
                        originalname: blob.type.replace("/", "."),
                        buffer: await blob.stream()
                    }
                    Playlist.addThumbnail(doc._id, fileobject);
                });
            })
            console.log(plistObj.name);
        }

        console.log("Playlist Generation complete.");
    } catch (error) {
        console.error("Playlist Generation failed:", error);
    }
    process.exit(1);
}

run();
