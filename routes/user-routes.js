const express = require('express');
const router = express.Router();
const usersController = require('../controllers/user-controllers');
const authMiddleware = require('../middleware/auth-middleware');

// register
router.get('/register', usersController.registerGet);
router.post('/register', usersController.registerPost);

//login
router.get('/login', usersController.loginGet);
router.post('/login', usersController.loginPost);

//profile
router.get('/profile',authMiddleware.isLoggedIn, usersController.profile);

//log out (kill session)
router.get('/logout', usersController.logout);

//edit user
router.get('/edit',authMiddleware.isLoggedIn, usersController.editUser);
router.post('/update',authMiddleware.isLoggedIn, usersController.updateUser)

//delete user
router.get('/delete',authMiddleware.isLoggedIn, usersController.displayUser)
router.post('/delete',authMiddleware.isLoggedIn, usersController.deleteUser)

//search friends
router.get('/search', authMiddleware.isLoggedIn, usersController.search)
router.get('/search-friend',authMiddleware.isLoggedIn, usersController.searchUser)

module.exports = router;