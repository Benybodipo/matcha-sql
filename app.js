const express = require('express');
const app = express();
const connection = require('./config/connection');
const validator = require('express-validator');
const cookieSession = require('cookie-session');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session);
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const xhbs = require('express-handlebars');
const nodemailer = require('nodemailer');
const expressip = require('express-ip');
const back = require('express-back');

// const flash = require('req-flash');
const flash = require('express-flash');


app.use(expressip().getIpInfoMiddleware);

const hbs = xhbs.create({
	extname: 'hbs',
	defaultLayout: 'main',
	layoutsDir: path.join(__dirname, 'views/layouts/'),
	helpers: {
		ifEquals: (value1, value2, options) => {
			if(value1 === value2) {
			  return options.fn(this);
			}
			return options.inverse(this);
		  }
	}
})
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());

app.use(validator()); 

app.use(session({
	secret: "abcd",
	resave: false,
	saveUninitialized: false,
	store: new MySQLStore({
		host: 'localhost',
		user: 'root',
		password: '', 
		multipleStatements: true,
		database: 'matcha'
	}),
	// cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(flash());

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
	res.locals.isAuthenticated = req.isAuthenticated();
	res.locals.user=req.user
    next();
});
app.use(back());

var indexController = require('./controllers/index-controller'),
	loginController = require('./controllers/login-controller'),
	homeController = require('./controllers/home-controller'),
	userController = require('./controllers/user-controller'),
	likeController = require('./controllers/likes-controller'),
	profileController = require('./controllers/profile-controller'),
	notifications = require('./controllers/notifications-controller'),
	inboxController = require('./controllers/inbox-controller');

var users = require('./controllers/users.contoller.js');

/*======================
	- GETS
======================*/
app.get("/", indexController);
app.get("/login", loginController.index);
app.get("/login/:username", loginController.index);
app.get("/login/:username/:id/:token/:type", loginController.index);

app.get("/forgot-password", users.forgotPassword);
app.get("/reset-password/:user_id/:token/:type", users.resetPassword);

app.get("/home", authenticationMiddleware(), homeController);
app.get("/user/:id", authenticationMiddleware(), userController);
app.get("/home/:age_min/:age_max/:distance/:gender/:interests", authenticationMiddleware(), homeController);
app.get("/profile", authenticationMiddleware(), profileController);

app.get("/inbox", authenticationMiddleware(), inboxController.page);
app.get("/inbox/:receiver", authenticationMiddleware(), inboxController.getMessages);

app.get("/matches", authenticationMiddleware(), inboxController.matches);
app.get("/fans", authenticationMiddleware(), inboxController.fans);
app.get("/visitors", authenticationMiddleware(), inboxController.visitors);

app.get("/notifications", authenticationMiddleware(), notifications.index);
app.get("/notifications/:id", authenticationMiddleware(), notifications.single);
app.get("/notifications/:id/delete", authenticationMiddleware(), notifications.delete);
app.post("/notifications/get-all", authenticationMiddleware(), notifications.getAll);
app.post("/notifications/delete-all", authenticationMiddleware(), notifications.deleteAll);
app.post("/notifications/mark-all-as-read", authenticationMiddleware(), notifications.markAllAsRead);


app.get("/logout", authenticationMiddleware(), function(req, res){
	req.logout();
	req.session.destroy();
	res.redirect("/login");
});

/*======================
	- POSTS
======================*/
app.post('/register', users.register);
app.post("/login", loginController.login, passport.authenticate('local', {
	successRedirect: '/home',
	failureRedirect: '/login'
}));
app.post("/forgot-password", users.forgotPassword);
app.post("/reset-password", users.resetPassword);


app.post("/inbox", inboxController.chat)
app.post('/profile', users.profile);
app.post("/likes", likeController.like);
// app.post("/search", searchController.search);


function authenticationMiddleware()
{
	return (req, res, next) => {
		if (req.isAuthenticated()) {
			return next();
		}
	    res.redirect('/login');
	}
}

app.listen(7500, function() {
	console.log("runing on port 7500");
});
