const User = require('../models/users-model');
const bcrypt = require('bcrypt');

exports.registerGet = (req, res) => {
    res.render('users/register', {
        error:null,
        username: '',
        email: '',
        avatar: ''
    })
}

exports.registerPost = async (req, res) => {
    try {
        const { username, email, password, avatar } = req.body || '';
        console.log(username,email,password,avatar)

        //check empty fields
        if (!username || !email || !password || !avatar) {
            return res.render('users/register', {
                error: "All fileds are required",
                username,
                email,
                avatar
            })
        }

        //password validation https://stackoverflow.com/questions/2370015/regular-expression-for-password-validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&!?]).{8,12}$/;
         if (!passwordRegex.test(password)) {
            return res.render('users/register', {
                error: "Password is invalid. Please follow the guidelines.",
                username,
                email,
                avatar
            });
        }

        const user = {
            username: username.trim(),
            email: email.trim(),
            password: await bcrypt.hash(password.trim(), 10),
            profilePicture: avatar
        };
        await User.createUser(user);
        console.log(`Successfully register with
            user:${user.username}
            email:${user.email}`)
        res.redirect('/user/login');

    } catch (error) {
        console.log('Error while registering\n', error);
        res.redirect('/user/register')
    }
}

exports.loginGet = (req, res) => {
    res.render('users/login');
}

exports.loginPost = async (req, res) => {
    try {
        const email = req.body.email.trim();
        const password = req.body.password.trim();

        const user = await User.findUserByEmail(email);

        if (!user) {
            console.log("User not found");
            return res.redirect('/user/login');
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log("Wrong password");
            return res.redirect('/user/login');
        }

        req.session.user = {
            id: user._id,
            email: user.email,
            username: user.username
        }

        console.log("Login successful");
        //need to link to index.html
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Error occured while trying to login', error);
        res.redirect('/user/login');
    }
}

exports.profile = async (req, res) => {
    const email = req.session.user.email;
    const user = await User.findUserByEmail(email);

    res.render('users/profile', { user });
}

exports.editUser = async (req, res) => {
    const email = req.session.user.email;
    const user = await User.findUserByEmail(email);

    res.render('users/edit-user', { user })
}

exports.updateUser = async (req, res) => {

    const email = req.session.user.email;
    const id = req.session.user.id;
    const user = await User.findUserByEmail(email);

    const newAvatar = req.body.newAvatar;
    const newUsername = req.body.newUsername;
    const newEmail = req.body.newEmail;

    if (!newAvatar || !newUsername || !newEmail) {
        return res.render('users/edit-user', { user: user })
    }

    try {
        let newUser = await User.updateUserByID(id, newUsername, newEmail, newAvatar);
        const updatedUser = await User.findUserByEmail(newEmail);
        req.session.user = {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email
        };
        console.log(`Updated successful: ${newUser}`)
        res.render('users/profile', { user: updatedUser });
    } catch (error) {
        console.log('Error while updating User', error);
        res.render('users/edit-user', { user: user })
    }
}

exports.displayUser = async (req, res) => {
    const email = req.session.user.email;
    const user = await User.findUserByEmail(email);

    res.render('users/delete-user', { user });
}

//delete hasn't done yet
exports.deleteUser = async (req, res) => {
    const email = req.session.user.email;
    const id = req.session.user.id;
    const user = await User.findUserByEmail(email);

    try {
        let user = await User.deleteUser(id);

        req.session.destroy((err) => {
            if (err) {
                console.log("Error while destorying session:", err);
                return res.redirect('/user/profile', { user })
            }
            res.redirect('/user/login')
        })
    } catch (error) {
        console.log('Error while deleting User', error);
        res.render('users/profile', { user: user })
    }
}
exports.search = async (req, res) => {
    res.render('users/search-friend', { result: '', query: '' });
}

exports.searchUser = async (req, res) => {
    const query = req.query.query;
    const currentUserId = req.session.user.id;

    if (!query) {
        return res.render('users/search-friend', { result: '', query: '' });
    }

    const users = await User.searchUsers(query, currentUserId);
    console.log(users);
    res.render('users/search-friend', { result: users, query: query });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/user/login');
    });
    console.log("Logout successful")
}
