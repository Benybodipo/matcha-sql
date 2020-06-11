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
		js: ["slider"]
	};
	var id = req.params.id;

	Users.findOne({_id: id}, function(err, user){
		if (err) throw err;
		var orStatement = [{userId1: id, userId2: req.user._id}, {userId2: id, userId1: req.user._id, match: 1}];

		Likes.findOne({$or: orStatement}, function(err, likes){
			if (err) throw err;
			var genderPrefence = ['male','female','both'];

			content.user = user;
			content.interests = getInterests(user.preferences.interests);
			content.genderPrefence = (user.preferences.gender) ? genderPrefence[user.preferences.gender - 1] : (user.gender == 'male') ? 'female' :'male';

			
			if (likes && ((likes.userId1.toString() == req.user._id.toString()) || (likes.userId2.toString() == req.user._id.toString())))
				content.like = "fas fa-star";
			else
				content.like = "far fa-star";

			res.render('user', content);
		});

	});

	Visits.findOne({userId: id, visitorId: req.user._id.toString()}, function(err, visitors){
		if (err) throw err;

		if (!visitors)
		{
			var addNewVisitor = new Visits({userId: id, visitorId: req.user._id.toString()});
			addNewVisitor.save(function(err){
				if (err) throw err;

				var link 	= req.protocol +  "://" + req.get('host') + "/user/" + req.user._id.toString();
				var message = req.user.username + " visited your profile";

				var newNotification = new Notifications({
					userId: mongoose.Types.ObjectId(id),
					userId2: req.user._id,
					type: 1,
					message: message,
					link: link
				});

				newNotification.save(function(err){
					if (err) throw err;
					console.log("New Notification");
				})
			});
		}
	});
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
