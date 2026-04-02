const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Review = require("../models/reviews-model");
const User = require("../models/users-model");
const Song = require("../models/songs-model");

dotenv.config({ path: path.join(__dirname, "../config.env") });

async function run() {
    try {
        await mongoose.connect(process.env.DB);

        const filePath = path.join(__dirname, "../data/review-dummy-data.json");
        const fileContents = await fs.readFile(filePath, "utf-8");
        const reviews = JSON.parse(fileContents);

        let insertedCount = 0;
        let skippedCount = 0;

        for (const reviewData of reviews) {
            const user = await User.findUserByUsername(reviewData.username);
            const song = await Song.findOne({ title: reviewData.songTitle }).select("_id");

            if (!user || !song) {
                console.warn(`Skipping review for "${reviewData.songTitle}" by "${reviewData.username}": user or song not found.`);
                continue;
            }

            const existingReview = await mongoose.model("Review").findOne({
                userId: user._id,
                songId: song._id.toString()
            });

            if (existingReview) {
                skippedCount += 1;
                continue;
            }

            await mongoose.model("Review").create({
                userId: user._id,
                songId: song._id.toString(),
                rating: reviewData.rating,
                comment: reviewData.comment,
                createdAt: reviewData.createdAt ? new Date(reviewData.createdAt) : new Date()
            });
            insertedCount += 1;
        }

        console.log(`Review seed complete. Inserted: ${insertedCount}, skipped: ${skippedCount}`);
    } catch (error) {
        console.error("Review seed failed:", error);
    } finally {
        await mongoose.connection.close();
    }
}

run();
