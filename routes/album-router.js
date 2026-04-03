const express = require('express');

const albumsController = require('./../controllers/album-controllers');

const router = express.Router();

// Show existing albums 
router.get("/browse", albumsController.showAlbumList);

// For song searching input in frontend
router.get("/song-search", albumsController.searchSongs);

// For creating albums
router.get("/create", albumsController.showAddForm);
router.post("/create", albumsController.createAlbum);

// For editing albums
router.get("/edit/:id", albumsController.showEditForm);
router.post("/edit/:id", albumsController.updateAlbum);

// For deleting albums
router.get("/delete/:id", albumsController.getMarkedAlbum);
router.post("/delete/:id", albumsController.deleteAlbum);

// Get album info after clicking on href link in /browse
router.get("/:id", albumsController.albumInfo);


module.exports = router;