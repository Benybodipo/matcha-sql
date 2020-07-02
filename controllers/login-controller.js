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
	if (req.session.flash)
		if (req.session.flash.inputs)
			content.inputs = req.session.flash.inputs[0];
	else
		content.inputs = {};
	
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