if (process.env.NODE_ENV !== 'production') {
	require("dotenv").config()
}

const express = require("express")
const app = express()
const path = require("path")
const mongoose = require("mongoose")
const ExpressError = require("./utils/ExpressError.js")
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")

const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")
const User = require("./models/user")
const mongoSanitize = require("express-mongo-sanitize")
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp" 
const secret = process.env.SECRET || "thisshouldbeabettersecret"
const MongoStore = require("connect-mongo")

mongoose.connect(dbUrl, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () =>{
	console.log("Database connected")
})

app.engine("ejs", ejsMate )
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended:true }))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))
app.use(mongoSanitize())

const store = MongoStore.create({
	mongoUrl: dbUrl,
	secret,
	ttl: 24 * 60 * 60,
})

store.on("error", function(err) {
	console.log("SESSION ERROR", err)
})

const sessionConfig = {
	store,
	name: "session",
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 1000*60*60*24*7,
		maxAge: 1000*60*60*24*7,
		httpOnly: true
	}
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
	res.locals.success = req.flash("success")
	res.locals.error = req.flash("error")
	res.locals.currentUser = req.user
	next()
})

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)


app.get("/", (req, res) => {
	res.render("home")
})

app.all("*", (req, res, next) => {next(new ExpressError("Page Not Found", 404))})

app.use((err, req, res, next) => {
	if(!err.message) err.message = "Oh no! Something went wrong :("
	if(!err.statusCode) err.statusCode = 500
	res.status(err.statusCode).render("error", {err})
})

const port = process.env.PORT || 8080
app.listen(port, () => {
	console.log(`Listening on Port ${port}`)
})
