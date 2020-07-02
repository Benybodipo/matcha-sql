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
		let interests = connection.query('SELECT * FROM interests WHERE 1;');
		let user_interests = connection.query('SELECT interests.*, user_interests.* FROM interests LEFT JOIN user_interests  ON user_interests.interest_id=interests.id WHERE user_id=?;', [req.user.id]);
		let images = connection.query('SELECT * FROM images WHERE user_id=?', [req.user.id]);

		if (req.user.bio == null || req.user.bio.trim() == ''){
			if (req.session.flash)
				if (!req.session.flash.warning)
					req.flash('warning', 'Please complete you profile info in order to access the full features.');
		}
		

		interests.forEach((interest, i) => {
			let active = user_interests.find((obj)=>{
				return (obj.active == 1 && obj.interest_id == interest.id);
			});
			
			if (active) 
				interests[i].active = 'checked'
		});

		let int = [];
		let start = 0, end = 2;
		for (let index = 0; index < interests.length; index += 2) {
			int.push(interests.slice(start, end));
			start = end;
			end += 2;
		}
		
		content.preferences = preferences[0];
		content.preferences.visible = (content.preferences.visible) ? 'checked' : "";
		content.interests = int;
		content.images =  images;
 
		content.sex = {
			men: (content.preferences.gender == 1) ? "checked" : "",
			women: (content.preferences.gender == 2) ? "checked" : "",
			both: (content.preferences.gender == 3) ? "checked" : ""
		}

		return res.render("profile", content);
	}
}
