const connection = require('../config/connection');
const GeoPoint = require('geopoint');
const GeoDistance = require('geo-distance');
const geoip = require('geoip-lite');
const publicIp = require('public-ip');
const ipLocation = require('ip-location')
const iplocate = require("node-iplocate");
const http = require('http'); 

module.exports = function(req, res)
{
	var content = {
		title: "Matcha | User Profile",
		css: ["profile","user"],
		js: ["slider"]
	};
	const {id} = req.params;
	const genderPrefence = ['Male','Female','Both genders'];
	content._user = connection.query('SELECT * FROM users WHERE id=?;', [id])[0];
	let interests = connection.query(`SELECT interests.*, user_interests.* 
									  FROM interests LEFT JOIN user_interests  
									  ON user_interests.interest_id=interests.id 
									  WHERE user_interests.user_id=? 
									  AND user_interests.active=?;`, [id, 1]);
	let preferences = connection.query('SELECT * FROM preferences WHERE user_id=?;', [id]);
	let profile_picture = connection.query('SELECT * FROM images WHERE user_id=? AND is_profile_picture=?;', [id, 1]);
	let likes = connection.query('SELECT * FROM likes WHERE (liker=? AND liked=?) OR (liked=? AND liker=? AND matched=?);', [req.user.id, id, req.user.id, id, 1]);
	let visit = connection.query('SELECT * FROM visits WHERE visitor_id=? AND visited_id=?;', [req.user.id, id]);

	content.profile_picture = profile_picture[0].image;
	content.preferences = preferences[0]; 
	content.interests = interests;
	content.like = (likes.length) ? "fas fa-star": "far fa-star";
	content.preferences.gender = genderPrefence[preferences[0].gender - 1];
	content._user.location = JSON.parse(content._user.location);

	// const location1 = content._user.location;
	// const location2 = JSON.parse(req.user.location);

	// const distance =  GeoDistance.between({lat: -33.950033, lon: 18.495859}, {lat: location1.latitude, lon: location1.longituder});

	// console.log(distance.human_readable());
	content.isProfileCompleted = ((req.user.bio == null || req.user.bio.trim() == '') || !req.user.interests.length) ? false : true;
	
	

	// CHECK IF IT WAS THE FIRST TIME YOU VISITING THIS USER
	if (!visit.length && id != req.user.id)
	{
		let link 	= `${req.protocol}://${req.get('host')}/user/${req.user.id}`;
		let message = req.user.username + " visited your profile";

		connection.query('INSERT INTO visits(visitor_id, visited_id) VALUES(?, ?);', [req.user.id, id]);
		connection.query('INSERT INTO notifications(sender, receiver, message, link, type) VALUES(?, ?, ?, ?, ?);', [req.user.id, id, message, link, 1]);
	}
	
	res.render('user', content);
}
