exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        console.log("SESSION:", req.session);
        console.log("User not logged in, redirecting to /login");
        return res.redirect('/user/login');
    }
    next();
}
