const express 			= require('express');
const passport 		= require('passport');
const LocalStrategy 	= require('passport-local').Strategy;
const bcrypt 			= require('bcryptjs');
const isOnline = require('is-online');
const connection 	 = require('../config/connection'); 
const iplocate = require("node-iplocate");
const faker = require('faker');
// Geolocation
const geoip = require('geoip-lite');
const http = require('http'); 
const { interests } = require('../models/schemas');

module.exports = function() {
	passport.use(new LocalStrategy({
		passReqToCallback: true,
	},function(req, username, password, done)
	{
		let user = connection.query("SELECT * FROM users WHERE username=? AND active=? LIMIT 1", [username, 1]);
		
		if (!user.length) {
			req.flash('error', {msg: "Invalid username or password."});
			req.flash('inputs', req.body);
			
			return done(null, false);
		}

		[user] = user;
		bcrypt.compare(password, user.password, function(err, isMatch){
			if (err) throw err;
			
			if (isMatch)
			{
				let birthday = new Date(user.birthday);
				let images = connection.query('SELECT * FROM images WHERE user_id=?;', [user.id]);
				let preferences = connection.query('SELECT * FROM preferences WHERE user_id=?;', [user.id]);

				if (!images.length)
				{
					var img = (user.gender == 'male') ? '/img/male.png' : '/img/female.jpeg';
					connection.query('INSERT INTO images(user_id, image, is_profile_picture) VALUEs(?, ?, ?);', [user.id, img, 1]);
				}
				
				if (!preferences.length)
				{
					var gender = (user.gender == 'male') ? 2 : 1;
					sql = `INSERT INTO preferences (user_id, gender, distance, min_age, max_age) VALUES(?, ?, ?, ?, ?);`;
					insert = connection.query(sql, [user.id, gender, 50, 18, 50]);
				}
				
				let interests = connection.query('SELECT * FROM user_interests WHERE user_id=? AND active=1;', [user.id]);
		
				user.interests = interests;
				
				connection.query("UPDATE users SET age=? WHERE id=?", [getAge(birthday), user.id]);
				isOnline().then(online => {
					if(online){
						http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
							resp.on('data', function(ip) {
								iplocate(ip.toString()).then(function(results) {
									let location = JSON.stringify(results, null, 2);
									connection.query("UPDATE users SET location=? WHERE id=?", [location, user.id]);
									return done(null, user);
								});

							});
						});
					}
					else
						return done(null, user);
				});
				
				// return done(null, user);
			}
			else{
				req.flash('error', {msg: "Invalid username or password."});
				req.flash('inputs', req.body);
				
				return done(null, false);
			}
		});
	}));
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
