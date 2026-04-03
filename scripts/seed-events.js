const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Event = require("../models/events-model");
const User = require("../models/users-model");

dotenv.config({ path: path.join(__dirname, "../config.env") });

async function run() {
    try {
        await mongoose.connect(process.env.DB);

        const filePath = path.join(__dirname, "../data/event-dummy-data.json");
        const fileContents = await fs.readFile(filePath, "utf-8");
        const events = JSON.parse(fileContents);

        let createdCount = 0;
        let updatedCount = 0;

        for (const eventData of events) {
            const author = await User.findUserByUsername(eventData.authorUsername);

            if (!author) {
                console.warn(`Skipping event "${eventData.name}": author "${eventData.authorUsername}" not found.`);
                continue;
            }

            const participants = await Promise.all(
                (eventData.participantUsernames || []).map((username) => User.findUserByUsername(username))
            );

            const participantIds = participants
                .filter(Boolean)
                .map((user) => user._id)
                .filter((id) => !id.equals(author._id));

            const eventPayload = {
                name: eventData.name,
                author: author._id,
                desc: eventData.desc,
                date: new Date(eventData.date),
                entryFee: eventData.entryFee,
                location: eventData.location,
                capacity: eventData.capacity,
                participants: participantIds
            };

            const existingEvent = await mongoose.model("Event").findOne({
                name: eventPayload.name,
                author: eventPayload.author
            });

            let eventId;

            if (!existingEvent) {
                const createdEvent = await Event.addEvent(eventPayload);
                eventId = createdEvent._id;
                createdCount += 1;
            } else {
                await mongoose.model("Event").updateOne(
                    { _id: existingEvent._id },
                    { $set: eventPayload }
                );
                eventId = existingEvent._id;
                updatedCount += 1;
            }

            await mongoose.model("User").updateMany(
                { _id: { $in: participantIds } },
                { $addToSet: { events: eventId } }
            );
        }

        console.log(`Event seed complete. Inserted: ${createdCount}, updated: ${updatedCount}`);
    } catch (error) {
        console.error("Event seed failed:", error);
    } finally {
        await mongoose.connection.close();
    }
}

run();
