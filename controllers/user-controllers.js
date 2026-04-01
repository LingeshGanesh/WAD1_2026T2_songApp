const User = require('../models/users-model');
const Playlist = require('../models/playlists-model');
const Reviews = require('../models/reviews-model');
const Song = require('../models/songs-model');
const bcrypt = require('bcrypt');

exports.stats = (req, res) => {
    req.session.visit_count = req.session.visit_count + 1 || 1;
    res.send('Number of visits: ' + req.session.visit_count);
}

exports.registerGet = (req, res) => {
    res.render('users/register', {
        errors: null,
        formData: { username: '', email: '', avatar: '', password: '', cfmpassword: '' }
    })
}

exports.registerPost = async (req, res) => {
    try {
        const { username = '', email = '', password = '', cfmpassword = '', avatar = '' } = req.body;
        //console.log(username, email, avatar, password, cfmpassword);

        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        //check avatar
        const allowedAvatars = [
            '/image/profilepic1.jpg',
            '/image/profilepic2.jpg',
            '/image/profilepic3.jpg',
            '/image/profilepic4.jpg',
            '/image/profilepic5.jpg'
        ];

        let errors = [];

        //check empty fields
        if (!trimmedUsername) errors.push("Username is required");
        if (!trimmedEmail) errors.push("Email is required");
        //password validation https://stackoverflow.com/questions/2370015/regular-expression-for-password-validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&!?]).{8,}$/;
        if (!password) {
            errors.push("Password is required");
        } else if (!passwordRegex.test(password)) {
            errors.push("Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@#$%^&!?)");
        };
        //console.log(password)
        if (!cfmpassword) {
            errors.push("Please confirm your password");
        } else if (password !== cfmpassword) {
            errors.push("Passwords do not match");
        }

        if (!avatar) {
            errors.push("Please select a profile picture");
        } else if (!allowedAvatars.includes(avatar)) {
            errors.push("Please select a valid profile picture");
        }

        const existUsername = await User.findUserByUsername(trimmedUsername);

        if (existUsername) {
            errors.push("Username is already taken ")
        };

        const existEmail = await User.findUserByEmail(trimmedEmail);

        if (existEmail) {
            errors.push("Email is already in the system")
        };

        if (errors.length > 0) {
            return res.render('users/register', {
                errors,
                formData: req.body
            });
        }

        const user = {
            username: trimmedUsername,
            email: trimmedEmail,
            password: await bcrypt.hash(password, 10),
            profilePicture: avatar
        };

        // check user exist inside or not if not don't update
        await User.createUser(user);
        console.log(`Successfully register with
            user:${user.username}
            email:${user.email},
            cfmpassword`)
        return res.redirect('/user/login');

    } catch (error) {
        console.log('Error while registering\n', error);
        return res.render('users/register', {
            errors: ["Error while uploading"],
            formData: req.body
        })

    }
}

exports.loginGet = (req, res) => {
    const msg = req.query.msg || '';
    if (req.session.user) {
        return res.redirect('/');
    }

    res.render('users/login', {
        formData: { email: '' },
        errors: null,
        msg
    });
}

exports.loginPost = async (req, res) => {
    try {
        const { email = '', password = '' } = req.body;
        const trimmedEmail = email.trim().toLowerCase();


        let errors = [];

        //check empty
        if (!trimmedEmail) errors.push("Email is required");
        if (!password) errors.push("Password is required");

        if (errors.length > 0) {
            return res.render('users/login', {
                errors,
                formData: { email: trimmedEmail },
                msg: null
            });
        }

        const user = await User.findUserByEmail(trimmedEmail);

        if (!user) {
            return res.render('users/login', {
                errors: ["Invalid email or password"],
                formData: { email: trimmedEmail },
                msg: null,
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render('users/login', {
                errors: ["Invalid email or password"],
                formData: { email: trimmedEmail },
                msg: null
            });
        }

        //regenerate new session (everytime login)
        //https://www.tutorialpedia.org/blog/nodejs-express-regenerate-session/
        req.session.regenerate((err) => {
            if (err) {
                console.log(err);
                return res.render('users/login', {
                    errors: ['Session error, please try again'],
                    formData: { email: trimmedEmail },
                    msg: null
                });
            }

            req.session.user = {
                id: user._id,
                email: user.email,
                username: user.username
            };

            //save session before redirect
            req.session.save((err) => {
                if (err) {
                    console.log(err);
                    return res.render('users/login', {
                        errors: ['Session save failed'],
                        formData: { email: trimmedEmail },
                        msg: null
                    });
                }

                console.log("Login successful");
                return res.redirect('/homepage');
            });
        });
    } catch (error) {
        console.error('Error occured while trying to login', error);
        return res.render('users/login', {
            errors: ["Something went wrong. Please try again."],
            formData: req.body,
            msg: null
        });
    }
}

exports.profile = async (req, res) => {
    try {
        const playlists = await Playlist.retrieveByOwnerID(req.user._id);
        await User.markAlertsRead(req.user._id);

        const reviewsEntered = await Reviews.findByUserId(req.user._id); // maegan
        console.log("Reviews entered by user:", reviewsEntered); // maegan
        console.log(req.user._id) // maegan

        const allSongs = await Song.retrieveAll(); // maegan
    
        res.render('users/profile', { user: req.user, playlists, reviewsEntered, allSongs});

    } catch (error) {
        console.error("Error loading profile:", error);
        res.redirect('/homepage');
    }
}

exports.editUser = async (req, res) => {
    try {
        res.render('users/edit-user', {
            user: req.user,
            errors: '',
            formData: {
                newUsername: '',
                newEmail: '',
                newAvatar: ''
            }
        })
    } catch (error) {
        console.error("Error loading data of user to edit:", error);
        res.redirect('/user/profile');
    }

}

exports.updateUser = async (req, res) => {
    let user = req.user;
    try {
        const id = user._id;
        const { newUsername = '', newEmail = '', newAvatar = '' } = req.body;
        const avatarToSave = newAvatar || user.profilePicture;

        let errors = [];

        //check avatar
        const allowedAvatars = [
            '/image/profilepic1.jpg',
            '/image/profilepic2.jpg',
            '/image/profilepic3.jpg',
            '/image/profilepic4.jpg',
            '/image/profilepic5.jpg'
        ];

        if (!newAvatar) {
            errors.push("Please select a profile picture");
        } else if (!allowedAvatars.includes(newAvatar)) {
            errors.push("Please select a valid profile picture");
        }

        //check empty
        if (!newUsername) errors.push("Username is required");
        if (!newEmail) errors.push("Email is required");

        const trimmedUsername = newUsername.trim();
        const trimmedEmail = newEmail.trim();

        //check if new username or email is already taken
        const existUsername = await User.findUserByUsername(trimmedUsername);
        if (existUsername && !existUsername._id.equals(id)) {
            errors.push("Username is already taken");
        }

        const existEmail = await User.findUserByEmail(trimmedEmail);
        if (existEmail && !existEmail._id.equals(id)) {
            errors.push("Email is already in the system");
        }

        if (errors.length > 0) {
            return res.render('users/edit-user', {
                user,
                errors,
                formData: req.body
            });
        }

        await User.updateUserByID(id, trimmedUsername, trimmedEmail, avatarToSave);
        const updatedUser = await User.findUserByID(id);

        //update session
        req.session.user = {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email
        };

        console.log(`Updated successful: 
                    Email: ${updatedUser.email}
                    Username: ${updatedUser.username}`)
        const playlists = await Playlist.retrieveByOwnerID(req.user._id);
        res.render('users/profile', { user: updatedUser, playlists });
    } catch (error) {
        console.log('Error while updating User', error);

        res.render('users/edit-user', {
            user: user || {},
            errors: ["Something went wrong. Please try again."],
            formData: req.body
        })
    }
}

exports.getEditPswForm = (req, res) => {
    console.log("Updating password")
    res.render('users/change-password', {
        errors: null,
        formData: {
            currentPassword: '',
            newPassword: '',
            cfmPassword: ''
        }
    })
}

exports.updatePassword = async (req, res) => {

    try {
        const id = req.session.user.id;
        const { currentPassword = '', newPassword = '', cfmPassword = '' } = req.body;
        // console.log(currentPassword, cfmPassword, newPassword);
        let errors = [];

        if (!currentPassword) errors.push('Please type in current password!');

        const user = await User.findUserByID(id);

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            errors.push('Current password is wrong')
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&!?]).{8,}$/;

        if (!newPassword) {
            errors.push('Please type in new password!');
        } else if (!passwordRegex.test(newPassword)) {
            errors.push("Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@#$%^&!?)");
        }

        if (!cfmPassword) {
            errors.push("Please confirm your password");
        } else if (newPassword !== cfmPassword) {
            errors.push("Passwords do not match");
        }

        if (newPassword === currentPassword) {
            errors.push("New password must be different from current password");
        }

        if (errors.length > 0) {
            return res.render('users/change-password', {
                errors,
                formData: req.body
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePasswordByID(id, hashedPassword);

        console.log('Successfully updated password');
        req.session.destroy(err => {
            if (err) {
                console.log(err);
                return res.redirect('/user/profile');
            }

            res.redirect('/user/login?msg=Password updated, please login again');
        });
    } catch (error) {
        console.error("Error while updating password", error);
        res.render('users/change-password', {
            errors: ["Something went wrong. Try again."],
            formData: req.body
        })
    }
}

exports.displayUser = async (req, res) => {
    try {
        res.render('users/delete-user', { user: req.user });
    } catch (error) {
        console.error("Error loading profile:", error);
        res.redirect('/homepage');
    }
};

exports.deleteAll = async (req, res) => {
    try {
        const id = req.session.user.id;

        await User.deleteUserAndData(id);

        req.session.destroy((err) => {
            if (err) {
                console.log("Error while destorying session:", err);
                return res.redirect('/user/profile')
            }
            res.redirect('/user/login')
        })
    } catch (error) {
        console.log('Error while deleting User', error);
        res.redirect('/user/profile')
    }
}

exports.search = async (req, res) => {
    try {
        const currentUserId = req.session.user.id;
        const suggestions = await User.getSuggestedUsers(currentUserId);

        res.render('users/search-friend', {
            result: [],
            query: '',
            errors: null,
            suggestions
        });
    } catch (error) {
        console.error('Error loading search page:', error);

        res.render('users/search-friend', {
            result: [],
            query: '',
            errors: null,
            suggestions: []
        });
    }
};


exports.searchUser = async (req, res) => {
    let suggestions = [];
    try {
        const query = req.query.query || '';
        const trimmedQuery = query.trim()
        const currentUserId = req.session.user.id;
        const suggestions = await User.getSuggestedUsers(currentUserId);

        if (!trimmedQuery) {
            return res.redirect('/user/search-friend');
        }

        const users = await User.searchUsers(trimmedQuery, currentUserId);

        if (users.length === 0) {
            return res.render('users/search-friend', {
                result: [],
                query: query,
                suggestions,
                errors: ["No username found"]
            });
        }
        res.render('users/search-friend', {
            result: users,
            query: query,
            errors: null,
            suggestions
        });
    } catch (error) {
        console.error("Error searching users:", error);

        res.render('users/search-friend', {
            result: [],
            query: req.query.query || '',
            errors: ["Something went wrong while searching. Please try again."],
            suggestions
        });
    }

}

exports.displayProfile = async (req, res) => {
    const id = req.query.id;

    try {
        const targetUser = await User.findUserByID(id);
        const currentUser = await User.findUserByID(req.session.user.id);

        if (currentUser._id.equals(targetUser._id)) {
            return res.redirect('/user/profile');

        }

        const playlists = await Playlist.retrievePublicByOwnerID(targetUser._id);

        //to decide whether to show following or follow
        const isFollowing = currentUser.followings?.some(f =>
            f.equals(targetUser._id)
        ) || false;

        //console.log(isFollowing, currentUser.followings, currentUser.followers, targetUser.followers, targetUser.followings);

        if (targetUser) {
            return res.render('users/profile-display', {
                user: targetUser,
                errors: [],
                isFollowing,
                playlists
            })
        } else {
            return res.render('users/search-friend', {
                result: [],
                errors: ["Something went wrong while displaying the profile"],
                isFollowing
            })
        }
    } catch (error) {
        console.log(error);
        return res.render('users/search-friend', {
            result: [],
            errors: ["Server error occurred"],
            isFollowing
        });
    }
}

exports.unfollowUser = async (req, res) => {
    console.log("Unfollowing user")
    try {
        const currentUserId = req.session.user.id;
        const targetUserId = req.body.targetUserId;

        if (currentUserId.toString() === targetUserId.toString()) {
            return res.redirect('/user/profile');
        }

        await User.unfollowUser(currentUserId, targetUserId);

        res.redirect(`/user/displayProfile?id=${targetUserId}`);
    } catch (error) {
        console.log('Error occurs while unfollowing user', error);
        res.redirect('/user/search-friend');
    }
}

exports.followUser = async (req, res) => {
    console.log("Following user")
    try {
        const currentUserId = req.session.user.id;
        const targetUserId = req.body.targetUserId;

        if (currentUserId.toString() === targetUserId.toString()) {
            return res.redirect('/user/profile');
        }

        await User.followUser(currentUserId, targetUserId);

        await User.addAlertToMany(
            [targetUserId],
            `${req.user.username} started following you`
        );

        res.redirect(`/user/displayProfile?id=${targetUserId}`);
    } catch (error) {
        console.log('Error occurs while following user', error);
        res.redirect('/user/search-friend');
    }
}

exports.showConnection = async (req, res) => {
    try {
        const type = req.query.type;
        const id = req.query.id;

        const user = await User.findUserByID(id);

        let userIds = [];

        if (type === 'followers') {
            userIds = user.followers;
        } else if (type === 'following') {
            userIds = user.followings;
        }

        const list = await User.findUsers(userIds);

        return res.render('users/display-connection', {
            list,
            type,
            errors: [],
            user,
            currentUserId: req.session.user.id
        });

    } catch (error) {
        console.log("Error while trying to load connections", error);

        return res.render('users/display-connection', {
            list: [],
            type: '',
            errors: ['Server error occurred'],
            user: null,
            currentUserId: req.session.user.id
        });
    }
};

// function to clear all alerts
exports.clearAlerts = async (req, res) => {
    await User.clearAlerts(req.session.user.id);
    res.redirect('/user/profile');
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/user/login');
    });
    console.log("Logout successful")
}

