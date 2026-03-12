const express = require("express");
const server = express();
const path = require("path");

// Middleware
server.use(express.static(path.join(__dirname, "public")));
server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');
server.set("views", path.join(__dirname, "views"));

// Routes
server.get("/", (req, res) => {
    res.render("base");
});

// Initialize Server
const hostname = "localhost";
const port = 8000;

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});