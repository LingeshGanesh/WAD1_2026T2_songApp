const express = require('express');
const router = express.Router();
const usersController = require('../controllers/user-controllers');
const authMiddleware = require('../middleware/auth-middleware');

router.get('/stats', usersController.stats);

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
router.post('/update',authMiddleware.isLoggedIn, usersController.updateUser);

//update password
router.get('/change-password',authMiddleware.isLoggedIn,usersController.getEditPswForm);
router.post('/change-password',authMiddleware.isLoggedIn,usersController.updatePassword);

//delete user
router.get('/delete',authMiddleware.isLoggedIn, usersController.displayUser);
router.post('/delete',authMiddleware.isLoggedIn, usersController.deleteAll);

//search friends
router.get('/search', authMiddleware.isLoggedIn, usersController.search);
router.get('/search-friend',authMiddleware.isLoggedIn, usersController.searchUser);
router.get('/displayProfile',authMiddleware.isLoggedIn,usersController.displayProfile);

//follow & unfollow
router.post('/followUser', authMiddleware.isLoggedIn, usersController.followUser);
router.post('/unfollowUser', authMiddleware.isLoggedIn, usersController.unfollowUser);

router.get('/showConnection', authMiddleware.isLoggedIn, usersController.showConnection);

// clear alerts
router.post('/clear-alerts', authMiddleware.isLoggedIn, usersController.clearAlerts);

module.exports = router;