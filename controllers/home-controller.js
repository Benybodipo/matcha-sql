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

	let query, params;
	if (Object.keys(req.params).length){
		query = `SELECT *, COUNT(user_interests.interest_id) as count_interests FROM users
				INNER JOIN images ON users.id=images.user_id  
				INNER JOIN preferences ON users.id=preferences.user_id  
				INNER JOIN user_interests ON users.id=user_interests.user_id 
					WHERE users.id!=${req.user.id} 
					AND images.is_profile_picture=1 
					AND (users.age >= ? AND users.age <=?) `;
		params = [req.params.age_min, req.params.age_max];

		if (req.params.interests != '0'){
			var interests = req.params.interests.split(',');
			var str_interests = '('
			for (i=0; i < interests.length; i++)
			{
				var tmp = (i < interests.length -  1) ? ', ':'';
				str_interests += `${interests[i]}${tmp}`;
				
			}
			str_interests+=')';
			query += `AND user_interests.interest_id IN ${str_interests} AND user_interests.active=1 `;
		}

		if (req.params.gender == 'male' || req.params.gender == 'female'){
			query += 'AND users.gender=? ';
			params.push(req.params.gender)
		}

		query += 'GROUP BY users.id '
		if (req.params.interests != '0')
			query += 'ORDER BY COUNT(user_interests.interest_id) DESC'
		query += ';'
	}
	else{
		query = `SELECT * FROM users 
		INNER JOIN images ON users.id=images.user_id
		WHERE users.id!=? 
			AND images.is_profile_picture=?;`;
		params = [req.user.id, 1];
	}
	
	content.users = connection.query(query, params);

	return res.render("home", content);
}
