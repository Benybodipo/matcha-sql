const connection = require('../config/connection');
const Users 		= require('../models/users.model');
const Visits 		= require('../models/visits.model');
const Likes 		= require('../models/likes.model');
const Notifications = require('../models/notifications.model');
const mongoose 		= require('mongoose');

module.exports = function(req, res)
{
	var content = {
		title: "Matcha | User Profile",
		css: ["profile","user"],
		js: ["slider"],
		user: req.user
	};
	const {id} = req.params;
	const genderPrefence = ['Male','Female','Both genders'];
	let interests = connection.query('SELECT interests.*, user_interests.* FROM interests LEFT JOIN user_interests  ON user_interests.interest_id=interests.id WHERE user_interests.user_id=? AND user_interests.active=?;', [id, 1]);
	let preferences = connection.query('SELECT * FROM preferences WHERE user_id=?;', [id]);
	let profile_picture = connection.query('SELECT * FROM images WHERE user_id=? AND is_profile_picture=?;', [id, 1]);
	let likes = connection.query('SELECT * FROM likes WHERE liker=?;', [id]);
	let visit = connection.query('SELECT * FROM visits WHERE visitor_id=? AND visited_id=?;', [req.user.id, id]);

	content.profile_picture = profile_picture[0].image;
	content.preferences = preferences[0]; 
	content.interests = interests;
	content.like = (likes.length) ? "fas fa-star": "far fa-star";
	content.preferences.gender = genderPrefence[preferences[0].gender - 1];

	// CHECK IF IT WAS THE FIRST TIME YOU VISITING THIS USER
	if (!visit.length)
	{
		let link 	= `${req.protocol}://${req.get('host')}/user/${req.user.id}`;
		let message = req.user.username + " visited your profile";

		connection.query('INSERT INTO visits(visitor_id, visited_id) VALUES(?, ?);', [req.user.id, id]);
		connection.query('INSERT INTO notifications(sender, receiver, message, link, type) VALUES(?, ?, ?, ?, ?);', [req.user.id, id, message, link, 1]);
	}
	res.render('user', content);
}

function getInterests(data)
{
	let interests = [];
	data.forEach((element) => {
		let classes;
		switch (element) {
			case 'movies':
				classes = 'fas fa-film';
				break;
			case 'art':
				classes = 'fas fa-palette';
				break;
			case 'food':
				classes = 'fas fa-utensils';
				break;
			case 'travel':
				classes = 'fas fa-plane-departure';
				break;
			case 'sport':
				classes = 'far fa-futbol';
				break;
			case 'music':
				classes = 'fas fa-music';
				break;
			case 'hiking':
				classes = 'fas fa-mountain';
				break;
			case 'books':
				classes = 'fas fa-book';
				break;
		}
		interests.push({name: element, class: classes});
	});

	return interests;
}
