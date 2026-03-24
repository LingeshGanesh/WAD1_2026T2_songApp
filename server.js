const express = require("express");
const server = express();
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require('dotenv');

// Load Env variable
dotenv.config({ path: './config.env' });

// Middleware
server.use(express.static(path.join(__dirname, "public")));
server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');
server.set("views", path.join(__dirname, "views"));

// Routes
const baseRouter = require("./routes/base-router.js")
server.use("/", baseRouter);

// Database connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

//Load Model
const User = require("./models/users-model");
const Song = require("./models/songs-model");
const Playlist = require("./models/playlists-model");
const Review = require("./models/playlists-model");

const eventRoutes = require("./routes/events-routes");

// Middleware
server.use(express.static(path.join(__dirname, "public")));
server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');
server.set("views", path.join(__dirname, "views"));

// Routes
server.get("/", (req, res) => {
  res.render("base");
});

server.use("/events", eventRoutes);


//testing

server.get("/add-song", async (req, res) => {
  await Song.create({
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    genre: "Pop",
    duration: 200
  });

  res.send("Song added to database");
});

// Initialize Server
function startServer() {
  const hostname = "localhost"; 
  const port = 8000;

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

// call connectDB first and when connection is ready we start the web server
connectDB().then(startServer);