const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const AlbumHelpers = require("../models/albums-model");
const Song = require("../models/songs-model");

dotenv.config({ path: path.join(__dirname, "../config.env") });

async function run() {
    try {
        await mongoose.connect(process.env.DB);

        const Album = mongoose.model("Album");
        const filePath = path.join(__dirname, "../data/album-dummy-data.json");
        const fileContents = await fs.readFile(filePath, "utf-8");
        const albums = JSON.parse(fileContents);

        let createdCount = 0;
        let updatedCount = 0;

        for (const albumData of albums) {
            const matchedSongs = await Song.find({
                title: { $in: albumData.songTitles }
            }).select("_id");

            const songIds = matchedSongs.map((song) => song._id);

            let album = await Album.findOne({ title: albumData.title });

            if (!album) {
                album = await AlbumHelpers.addAlbum({
                    title: albumData.title,
                    yearReleased: albumData.yearReleased,
                    songs: songIds,
                    createdBy: albumData.createdBy,
                    description: albumData.description
                });
                createdCount += 1;
            } else {
                await Album.findByIdAndUpdate(album._id, {
                    title: albumData.title,
                    yearReleased: albumData.yearReleased,
                    songs: songIds,
                    createdBy: albumData.createdBy,
                    description: albumData.description
                });
                updatedCount += 1;
            }

            await Song.updateMany(
                { _id: { $in: songIds } },
                { album: album._id }
            );
        }

        console.log(`Album seed complete. Created: ${createdCount}, updated: ${updatedCount}`);
    } catch (error) {
        console.error("Album seed failed:", error);
    } finally {
        await mongoose.connection.close();
    }
}

run();
