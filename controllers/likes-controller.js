const Likes 	= require('../models/likes.model');
const Chats 	= require('../models/chats.model');
const mongoose 	= require('mongoose');
const Notifications = require('../models/notifications.model');
const Messages	= require('../models/messages.model');

module.exports.getLikes = function(req, res){

	Likes.find({userId1: req.user._id}, function(err, likes){
		if (err) throw err;
		res.send(likes);
	});
}

module.exports.like = function(req, res){

	var id 			= req.body.userId;
	var orStatement = [{userId1: id, userId2: req.user._id}, {userId2: id, userId1: req.user._id}];

	Likes.findOne({$or: orStatement}, function(err, likes){
		if (err) throw err;

		if (likes)
		{
			// I was liked
			if ((likes.userId1.toString() == req.user._id.toString()) && likes.match ==  0)
			{
				if (likes.match ==  0)
				{
					Likes.updateOne({userId1: req.user._id, userId2: id}, {$set: {match: 1}}, function(err, success){
						if (err) throw err;

						var message = req.user.username + " is a new Match";
						var link = req.protocol +  "://" + req.get('host') + "/inbox";
						newNotification(id, req.user._id, 3, message, "/inbox");

						var newChat  = new Chats({
							sender: req.user._id,
							receiver: mongoose.Types.ObjectId(id)
						});

						newChat.save(function(err){
							if (err) throw err;
							
							let newMessage = new Messages({
								message: "Hi there, this is the begining an awesome frienship!!",
								sender: req.user._id,
								receiver: mongoose.Types.ObjectId(id),
								chatId: newChat._id
							});

							newMessage.save(function(err){
								if (err) throw err;
								res.send({return: 1});
							});
						});
						
					});
				}
			}
		}
		else
		{
			var like = new Likes({userId1: id, userId2: req.user._id});

			like.save(function(err){
				if (err) throw err;

				var message = req.user.username + " liked your profile";
				var link 	= req.protocol +  "://" + req.get('host') + "/user/" + req.user._id.toString();
				newNotification(id, req.user._id, 2, message, link);
				res.send({return: 1});
			});
		}
	});

}

function newNotification(destination, origin, type,  message, link)
{
	var newNotification = new Notifications({
		destination: mongoose.Types.ObjectId(destination),
		origin: origin,
		type: type,
		message: message,
		link: link
	});

	newNotification.save(function(err){
		if (err) throw err;
		console.log("New Notification");
	})
}
