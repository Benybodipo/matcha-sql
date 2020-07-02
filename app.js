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
	res.locals.user=req.user;
	
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
const { interests } = require('./models/schemas');
let middlewares = {
	isProfileCompleted: isProfileCompleted(),
	authenticationMiddleware: authenticationMiddleware()
}

/*======================
	- GETS
======================*/
app.get("/", indexController);
app.get("/login", loginController.index);
app.get("/login/:username", loginController.index);
app.get("/login/:username/:id/:token/:type", loginController.index);

app.get("/forgot-password", users.forgotPassword);
app.get("/reset-password/:user_id/:token/:type", users.resetPassword);

app.get("/home", middlewares.authenticationMiddleware, homeController);
app.get("/user/:id", middlewares.authenticationMiddleware, userController);
app.get("/home/:age_min/:age_max/:distance/:gender/:interests", authenticationMiddleware(), homeController);
app.get("/profile", authenticationMiddleware(), profileController);

app.get("/inbox", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, inboxController.page);
app.get("/inbox/:receiver", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, inboxController.getMessages);

app.get("/matches", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, inboxController.matches);
app.get("/fans", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, inboxController.fans);
app.get("/visitors", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, inboxController.visitors);

app.get("/notifications", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, notifications.index);
app.get("/notifications/:id", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, notifications.single);
app.get("/notifications/:id/delete", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, notifications.delete);
app.post("/notifications/get-all", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, notifications.getAll);
app.post("/notifications/delete-all", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, notifications.deleteAll);
app.post("/notifications/mark-all-as-read", middlewares.authenticationMiddleware, middlewares.isProfileCompleted, notifications.markAllAsRead);


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


function authenticationMiddleware()
{
	return (req, res, next) => {
		if (req.isAuthenticated()) {
			let interests = connection.query('SELECT * FROM user_interests WHERE user_id=? AND active=1;', [req.user.id]);
			req.user.interests = interests;
			return next();
		}
	    return res.redirect('/login');
	}
}

function isProfileCompleted()
{
	return (req, res, next) => {
		

		if ((req.user.bio == null || req.user.bio.trim() == '') || !req.user.interests.length){
			
			if (req.session.flash)
				if (!req.session.flash.warning)
					req.flash('warning', 'Please complete you profile info in order to access the full features.');
			return res.redirect('/profile');
		}
		return next();
	}
}



app.listen(7500, function() {
	console.log("runing on port 7500");
});
