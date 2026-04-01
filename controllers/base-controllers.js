exports.homepage = (req, res) => {
    const {user} = req.session;
    if (user) {
        res.render("home-user", {user});
    } else {
        res.render("home-guest");
    }
}