const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("../models/users-model");

dotenv.config({ path: path.join(__dirname, "../config.env") });

async function run() {
    try {
        await mongoose.connect(process.env.DB);

        const filePath = path.join(__dirname, "../data/user-dummy-data.json");
        const fileContents = await fs.readFile(filePath, "utf-8");
        const users = JSON.parse(fileContents);

        let insertedCount = 0;
        let updatedCount = 0;

        for (const user of users) {
            const userPayload = {
                _id: user._id,
                username: user.username,
                email: user.email,
                password: user.password,
                profilePicture: user.profilePicture,
                events: user.events || [],
                hasUnreadAlerts: user.hasUnreadAlerts ?? false
            };

            const existingUser = await User.findUserByEmail(user.email);

            if (!existingUser) {
                await User.createUser(userPayload);
                insertedCount += 1;
                continue;
            }

            await mongoose.model("User").updateOne(
                { _id: existingUser._id },
                {
                    $set: userPayload
                }
            );
            updatedCount += 1;
        }

        console.log(`User seed complete. Inserted: ${insertedCount}, updated: ${updatedCount}`);
    } catch (error) {
        console.error("User seed failed:", error);
    } finally {
        await mongoose.connection.close();
    }
}

run();
