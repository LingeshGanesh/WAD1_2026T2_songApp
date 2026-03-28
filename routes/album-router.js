const express = require('express');

const albumsController = require('./../controllers/album-controllers');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

router.get("/browse", authMiddleware.isLoggedIn, albumsController.showAlbumList);
router.get("/song-search", authMiddleware.isLoggedIn, albumsController.searchSongs);
router.get("/create", authMiddleware.isLoggedIn, albumsController.showAddForm);
router.post("/create", authMiddleware.isLoggedIn, albumsController.createAlbum);

// Specific routes before /:id
router.get("/edit/:id", authMiddleware.isLoggedIn, albumsController.showEditForm);
router.post("/edit/:id", authMiddleware.isLoggedIn, albumsController.updateAlbum);
router.get("/delete/:id", authMiddleware.isLoggedIn, albumsController.getMarkedAlbum);
router.post("/delete/:id", authMiddleware.isLoggedIn, albumsController.deleteAlbum);

// /:id must be last
router.get("/:id", authMiddleware.isLoggedIn, albumsController.albumInfo);


module.exports = router;