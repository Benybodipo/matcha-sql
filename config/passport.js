const express 			= require('express');
const app 				= express();
const passport 		= require('passport');
const LocalStrategy 	= require('passport-local').Strategy;
const bcrypt 			= require('bcryptjs');
const isOnline = require('is-online');
const connection 	 = require('../config/connection'); 
// Geolocation
const geoip = require('geoip-lite');
const http = require('http'); 

module.exports = function() {
	passport.use(new LocalStrategy(function(username, password, done)
	{
		let user = connection.query("SELECT * FROM users WHERE username=? AND active=? LIMIT 1", [username, 1]);

		if (!user.length) return done(null, false);

		user = user[0];
		bcrypt.compare(password, user.password, function(err, isMatch){
			if (err) throw err;
			
			if (isMatch)
			{
				let birthday = new Date(user.birthday);
				connection.query("UPDATE users SET age=? WHERE id=?", [getAge(birthday), user.id]);

				isOnline().then(online => {
					if(online){
						http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
							resp.on('data', function(ip) {
								let location = JSON.stringify(geoip.lookup(String(ip)));

								connection.query("UPDATE users SET location=? WHERE id=?", [location, user.id]);
								return done(null, user);
							});
						});
					}
					else
						return done(null, user);
				});
				
				return done(null, user);
			}
			else
				return done(null, false, { message: 'Wrong password!'});
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
