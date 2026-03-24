const User = require('../models/users-model');
const bcrypt = require('bcrypt');

exports.registerGet = (req, res) => {
    res.render('users/register')
}

exports.registerPost = async (req, res) => {
    try {
        const user = {
            username: req.body.username.trim(),
            email: req.body.email.trim(),
            password: await bcrypt.hash(req.body.password.trim(), 10),
            profilePicture: req.body.avatar
        };
        await User.createUser(user);
        console.log(`Successfully register with
            user:${user.username}
            password:${user.password}
            email:${user.email},
            profilePic:${user.profilePicture}`)
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

        const user = await User.findUser(email);

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
    const user = await User.findUser(email);

    res.render('users/profile', { user });
}

exports.editUser = async (req, res) => {
    const email = req.session.user.email;
    const user = await User.findUser(email);

    res.render('users/edit', { user })
}

exports.updateUser = async (req, res) => {

    const email = req.session.user.email;
    const id = req.session.user.id;
    const user = await User.findUser(email);

    const newAvatar = req.body.newAvatar;
    const newUsername = req.body.newUsername;
    const newEmail = req.body.newEmail;

    if (!newAvatar || !newUsername || !newEmail) {
        return res.render('users/edit', { user: user })
    }

    try {
        let newUser = await User.updateUser(id, newUsername, newEmail, newAvatar);
        const updatedUser = await User.findUser(newEmail);
        req.session.user = {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email
        };
        console.log(`Updated successful: ${newUser}`)
        res.render('users/profile', { user: updatedUser });
    } catch (error) {
        console.log('Error while updating User', error);
        res.render('users/edit', { user: user })
    }
}

exports.displayUser = async (req, res) => {
    const email = req.session.user.email;
    const user = await User.findUser(email);

    res.render('users/delete-user', { user });
}

//delete hasn't done yet
exports.deleteUser = async(req,res) => {
    const email = req.session.user.email;
    const id = req.session.user.id;
    const user = await User.findUser(email);

    try{
        let user = await User.deleteUser(id);
        
        req.session.destroy((err)=>{
            if(err){
                console.log("Error while destorying session:", err);
                return res.redirect('/user/profile',{user})
            }
            res.redirect('/user/login')
        })
    }catch (error) {
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
        return res.render('users/search-friend', {result: '', query: '' });
    }

    const users = await User.searchUsers(query, currentUserId);
    console.log(users);
    res.render('users/search-friend', {result: users, query: query });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/user/login');
    });
    console.log("Logout successful")
}
