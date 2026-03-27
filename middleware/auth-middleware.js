const User = require('../models/users-model');

exports.isLoggedIn = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect('/user/login');
        }

        const user = await User.findUserByID(req.session.user.id);

        if (!user) {
            return req.session.destroy(() => {
                res.redirect('/user/login');
            });
        }

        //can reuse the user array
        req.user = user; 
        next();

    } catch (err) {
        console.log("Auth error:", err);
        res.redirect('/user/login');
    }
};
