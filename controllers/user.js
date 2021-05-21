const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render("users/register")
}

module.exports.register = async(req, res) => {
    try {
        const {username, email, password} = req.body
        const newUser = new User({username, email})
        const registeredUser = await User.register(newUser, password)
        req.login(registeredUser, err => {
            if(err) next(err)
            req.flash("success", "Welcome to YelpCamp!")
            res.redirect("/campgrounds")
        })
    }
    catch(err) {
        const message = err.message
        req.flash("error", message)
        res.redirect("/register")
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login")
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!")
    const redirectUrl = req.session.returnTo || "/campgrounds"
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
	req.logout()
	req.flash("success", "Logged Out. Goodbye!")
	res.redirect("/campgrounds")
}