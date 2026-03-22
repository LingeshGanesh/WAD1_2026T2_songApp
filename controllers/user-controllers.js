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
            password: await bcrypt.hash(req.body.password.trim(), 10)
        };
        await User.createUser(user);
        console.log(`Successfully register with
            user:${user.username}
            password:${user.password}
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

        const user = await User.findUser(email);

        if (!user) {
            console.log("User not found");
            return res.redirect('/user/login');
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log("Wrong password");
            return res.redriect('/user/login');
        }

        req.session.user = {
            id: user._id,
            email: user.email
        }

        console.log("Login successful");
        //need to link to index.html
        res.send('successful')
    } catch (error) {
        console.error('Error occured while trying to login',err);
        res.redirect('/user/login');
    }
}