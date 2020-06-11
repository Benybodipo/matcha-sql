const nodemailer = require('nodemailer');
const Likns		 = require('../models/links.model');
const mail 		 = require("../config/nodemailer");
const connection 		 = require("../config/connection");
const Users 	  = require('../models/users.model');
const Preferences = require('../models/preferences.model');
// Geolocation
const geoip = require('geoip-lite');
const http = require('http'); 



module.exports = function(req, res)
{
	var page = req.url.split("/").filter(function(item) { return item !== "";})[0];
	var gender = ['male', 'female'];

	var content = {
		title: "Matcha | Welcome",
		css: ["chat"],
		js: ["search"],
		isHome: (page == "home") ? true : false
	};

	// let query = (Object.keys(req.params).length) ? {
	// 	_id: {$ne: req.user.id},
	// 	age: {$gte: req.params.age_min, $lte: req.params.age_max},
	// 	// 'preferences.interests': {$in: req.params.interests.split(',')},
	// } : {_id: {$ne: req.user.id}};

	
	if (parseInt(req.params.gender) <= gender.length )
		query.gender = {$eq: gender[req.params.gender - 1]};
	
	const users = connection.query("SELECT * FROM users RIGHT JOIN images ON users.id=images.user_id WHERE images.is_profile_picture=?;", [1]);
	
	content.users = users;
	return res.render("home", content);
}
