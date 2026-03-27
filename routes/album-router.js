const express = require('express');

const albumsController = require('./../controllers/album-controllers');

const router = express.Router();

// Show list of existing albums
router.get("/browse", albumsController.showAlbumList);

// Creation of album
router.get("/create", albumsController.showAddForm);
router.post("/create", albumsController.createAlbum);

// Get album info after clicking on href from /browse
router.get("/:id", albumsController.albumInfo);

// Edit Albums
router.get("/edit/:id", albumsController.showEditForm);
router.post("/edit/:id", albumsController.updateAlbum);


// Delete Albums
router.get("/delete/:id", albumsController.getMarkedAlbum);
router.post("/delete/:id", albumsController.deleteAlbum);


module.exports = router;