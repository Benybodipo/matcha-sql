const Users 		= require('../models/users.model');
const Links 		= require('../models/links.model');
const Preferences = require('../models/preferences.model');
const connection 	 = require('../config/connection');
// Geolocation
const geoip = require('geoip-lite');
const http = require('http'); 

const passport 		= require('passport');
const LocalStrategy 	= require('passport-local').Strategy;
const bcrypt 			= require('bcryptjs');
const isOnline = require('is-online');
const iplocate = require("node-iplocate");

module.exports.index = function(req, res)
{
	var content = {
		title: "Matcha | Login",
		css: ["home", "login"],
		js: ["slider"],
		layout: 'index',
		username: (req.params.username) ? req.params.username : ""
	};
	content.inputs = (req.session.flash.inputs) ? req.session.flash.inputs[0] : {};
	
	const {id, token} = req.params;
	if (token)
	{
		let links = connection.query("SELECT * FROM links WHERE user_id=? AND token=?;", [id, token]);

		if (links.length)
		{
			let user = connection.query("SELECT * FROM users WHERE id=? AND active=?;", [id, 0]);
			
			if (user.length)
			{
				let update = connection.query("UPDATE users SET active=? WHERE id=?", [1, id]);

				if (update)
				{
					let gender = (user.gender == "male") ? 2 : 1;
					let img = (user.gender == "male") ? "/img/male.png" : "/img/female.jpeg";
					
					connection.query("INSERT INTO preferences(user_id, gender, distance, min_age, max_age) VALUES(?, ?, ?, ?, ?);", [id, gender, 50, 18, 50]); 
					connection.query("INSERT INTO images(user_id, image, is_profile_picture) VALUES(?, ?, ?);", [id, img, 1])
					connection.query("DELETE FROM links WHERE user_id=? AND token=?;", [id, token])
				}
			}
		}
	}
	
	if (req.isAuthenticated())
		res.redirect("/home");
	else
		res.render('login', content);
}

module.exports.login = function(req, res, next){
	req.check("username", "Username is required.").notEmpty();
	req.check("password", "Password is required.").notEmpty();
	
	if (req.validationErrors())
	{
		req.flash('error', req.validationErrors());
		return res.redirect("/login");
	}
	next();
	// else
	// {	
	// 	passport.use(new LocalStrategy((username, password, done) => 
	// 	{
	// 		console.log(username);
			
	// 		let user = connection.query("SELECT * FROM users WHERE username=? AND active=? LIMIT 1", [username, 1]);
			
	// 		if (!user.length) {
	// 			req.flash('error', "Invalid username or password.");
	// 			return done(null, false);
	// 		}
	
	// 		user = user[0];
	// 		bcrypt.compare(password, user.password, function(err, isMatch){
	// 			if (err) throw err;
				
	// 			if (isMatch)
	// 			{
	// 				let birthday = new Date(user.birthday);
	// 				connection.query("UPDATE users SET age=? WHERE id=?", [getAge(birthday), user.id]);
	
	// 				isOnline().then(online => {
	// 					if(online){
	// 						http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
	// 							resp.on('data', function(ip) {
	// 								iplocate(ip.toString()).then(function(results) {
										
	// 									let location = JSON.stringify(results, null, 2);
	// 									connection.query("UPDATE users SET location=? WHERE id=?", [location, user.id]);
	// 									return done(null, user);
	// 								});
	
	// 							});
	// 						});
	// 					}
	// 					else
	// 						return done(null, user);
	// 				});
					
	// 				// return done(null, user);
	// 			}
	// 			else{
	// 				req.flash('error', "Invalid username or password.");
	// 				return done(null, false);
	// 			}
	// 		});
	// 	}));

	// }
}

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	let user = connection.query("SELECT * FROM users WHERE id=?;", [id]);
	
	if (user.length) 
		done(null, user[0]);
});

function getAge(birthday)
{
	var ageDifMs = Date.now() - birthday.getTime();
	var ageDate = new Date(ageDifMs);
	return Math.abs(ageDate.getUTCFullYear() - 1970);
}