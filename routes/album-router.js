const express = require('express');

const albumsController = require('./../controllers/album-controllers');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

// Show existing albums 
router.get("/browse", authMiddleware.isLoggedIn, albumsController.showAlbumList);

// For song searching input in frontend
router.get("/song-search", authMiddleware.isLoggedIn, albumsController.searchSongs);

// For creating albums
router.get("/create", authMiddleware.isLoggedIn, albumsController.showAddForm);
router.post("/create", authMiddleware.isLoggedIn, albumsController.createAlbum);

// For editing albums
router.get("/edit/:id", authMiddleware.isLoggedIn, albumsController.showEditForm);
router.post("/edit/:id", authMiddleware.isLoggedIn, albumsController.updateAlbum);

// For deleting albums
router.get("/delete/:id", authMiddleware.isLoggedIn, albumsController.getMarkedAlbum);
router.post("/delete/:id", authMiddleware.isLoggedIn, albumsController.deleteAlbum);

// Get album info after clicking on href link in /browse
router.get("/:id", authMiddleware.isLoggedIn, albumsController.albumInfo);


module.exports = router;