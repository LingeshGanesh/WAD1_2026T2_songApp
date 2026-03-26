const express = require("express");
const server = express();
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

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