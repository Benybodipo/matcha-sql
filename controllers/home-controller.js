const nodemailer = require('nodemailer');
const Likns		 = require('../models/links.model');
const mail 		 = require("../config/nodemailer");
const connection 		 = require("../config/connection");
const Users 	  = require('../models/users.model');
const Preferences = require('../models/preferences.model');
// Geolocation
const geoip = require('geoip-lite');
const http = require('http'); 
const faker = require('faker');


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
					AND users.active=1
					AND (user_interests.user_id!=${req.user.id} AND user_interests.active=1)
					AND users.bio IS NOT NULL
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
		let preferences = connection.query('SELECT * FROM preferences WHERE user_id=? LIMIT 1;', [req.user.id])[0];

		query = `SELECT * FROM users 
		INNER JOIN images ON users.id=images.user_id
		INNER JOIN preferences ON users.id=preferences.user_id
		INNER JOIN user_interests ON users.id=user_interests.user_id
		WHERE users.active=1
		AND (user_interests.user_id!=? AND user_interests.active=1)
		AND users.id!=? 
		AND users.bio IS NOT NULL
		AND images.is_profile_picture=?
		AND users.age >=? AND users.age <=? `;
		params = [req.user.id, req.user.id, 1, preferences.min_age, preferences.max_age];
		
		if (preferences.gender == 1 || preferences.gender == 2){
			var tmp = (preferences.gender == 1) ? 'male' : 'female';
			query += 'AND users.gender=?';
			params.push(tmp);
		}
		query += ' GROUP BY users.id;'
	}

	let blocked = connection.query(`SELECT account_id FROM block_list WHERE user_id=${req.user.id}`);
	let users = connection.query(query, params);

	blocked = blocked.map(function (block){
		return block.account_id;
	})

	let userss = connection.query(query, params).map(function (user) {
		if (!blocked.includes(user.user_id))
			return user
	});

	content.users = userss;
	
	return res.render("home", content);
}
