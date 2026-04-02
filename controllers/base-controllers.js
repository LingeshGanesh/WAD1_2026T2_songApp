exports.guestpage = (req, res) => {
    const {user} = req.session;
    if (user) {
        res.redirect("/homepage");
    } else {
        res.render("home-guest");
    }
}

exports.homepage = (req, res) => {
    const {user} = req.session;
    res.render("home-user", {user});
}