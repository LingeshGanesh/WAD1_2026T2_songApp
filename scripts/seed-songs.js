const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Song = require("../models/songs-model");

dotenv.config({ path: path.join(__dirname, "../config.env") });

async function run() {
    try {
        await mongoose.connect(process.env.DB);

        const filePath = path.join(__dirname, "../data/song-dummy-data.json");
        const fileContents = await fs.readFile(filePath, "utf-8");
        const songs = JSON.parse(fileContents);

        let insertedCount = 0;
        let skippedCount = 0;

        for (const song of songs) {
            const existingSong = await Song.findOne({
                uploader: song.uploader,
                title: song.title,
                artist: song.artist,
                album: song.album || null
            });

            if (existingSong) {
                skippedCount += 1;
                continue;
            }

            await Song.createSong(song);
            insertedCount += 1;
        }

        console.log(`Song seed complete. Inserted: ${insertedCount}, skipped: ${skippedCount}`);
    } catch (error) {
        console.error("Song seed failed:", error);
    } finally {
        await mongoose.connection.close();
    }
}

run();
