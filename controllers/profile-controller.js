const Users 	  = require('../models/users.model');
const connection = require('../config/connection');

module.exports = function(req, res)
{
	let user = connection.query('SELECT * FROM users WHERE id=?;',[req.user.id]);

	if (user.length)
	{
		var content = {
			title: "Matcha | Profile",
			css: ["profile"],
			js: ["profile"],
			user: req.user,
			location: JSON.parse(req.user.location)
		};

		let preferences = connection.query('SELECT * FROM preferences WHERE user_id=?', [req.user.id]);
		let images = connection.query('SELECT * FROM images WHERE user_id=?', [req.user.id]);

		content.preferences = preferences[0];
		content.images =  images;

		content.sex = {
			men: (content.preferences.gender == 1) ? "checked" : "",
			women: (content.preferences.gender == 2) ? "checked" : "",
			both: (content.preferences.gender == 3) ? "checked" : ""
		}
		// var interests = req.user.preferences.interests;
		// content.interests = {
		// 	movies: (interests.indexOf("movies") >= 0) ? "checked" : "",
		// 	art: (interests.indexOf("art") >= 0) ? "checked" : "",
		// 	food: (interests.indexOf("food") >= 0) ? "checked" : "",
		// 	travel: (interests.indexOf("travel") >= 0) ? "checked" : "",
		// 	sports: (interests.indexOf("sport") >= 0) ? "checked" : "",
		// 	music: (interests.indexOf("music") >= 0) ? "checked" : "",
		// 	hiking: (interests.indexOf("hiking") >= 0) ? "checked" : "",
		// 	books: (interests.indexOf("books") >= 0) ? "checked" : ""
		// }

		return res.render("profile", content);
	}
}
