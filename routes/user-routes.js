const express = require('express');
const router = express.Router();
const usersController = require('../controllers/user-controllers');
const authMiddleware = require('../middleware/auth-middleware');

router.get('/register', usersController.registerGet);

router.post('/register', usersController.registerPost);

router.get('/login', usersController.loginGet);

router.post('/login', usersController.loginPost);

router.get('/profile',authMiddleware.isLoggedIn, usersController.profile);

router.get('/logout', usersController.logout);

module.exports = router;