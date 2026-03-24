const express = require('express');
const router = express.Router();

const songControllers = require('../controllers/song-controllers');

router.get('/browse', songControllers.browse);
router.get('/create', songControllers.showCreationForm);
router.post('/create', songControllers.create);
router.post('/import', songControllers.importSongs);
router.get('/search/:songID', songControllers.search);
router.get('/edit/:songID', songControllers.showEditForm);
router.post('/edit/:songID', songControllers.update);
router.post('/delete/:songID', songControllers.delete);
router.get('/:songID/open', songControllers.redirectToYoutube);
router.get('/:songID', songControllers.songInfo);

module.exports = router;
