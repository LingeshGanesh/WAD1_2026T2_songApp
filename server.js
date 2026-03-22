const express = require("express");
const server = express();
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const session = require('express-session');

// Load Env variable
dotenv.config({ path: './config.env' });

// Middleware
server.use(express.static(path.join(__dirname, "public")));
server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');
server.set("views", path.join(__dirname, "views"));

// session ID

const secret = process.env.SECRET;
server.use(session({
  secret: secret, // sign the session ID cookie. should be a long, random, and secure string, preferably stored in an environment variable
  resave: false, // Prevents the session from being saved back to the session store if nothing has changed.
  saveUninitialized: false // Prevents a new, empty session from being saved to the store.
}));

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