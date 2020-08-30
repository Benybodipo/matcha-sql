const Likes 	= require('../models/likes.model');
const Chats 	= require('../models/chats.model');
const mongoose 	= require('mongoose');
const Notifications = require('../models/notifications.model');
const Messages	= require('../models/messages.model');
const connection  = require('../config/connection');

module.exports.getLikes = function(req, res){

	Likes.find({userId1: req.user._id}, function(err, likes){
		if (err) throw err;
		res.send(likes);
	});
}

module.exports.like = function(req, res){

	const id = req.body.userId;
	let like = connection.query('SELECT * FROM likes WHERE (liker=? AND liked=?) OR (liker=? AND liked=?)', [req.user.id, id, id, req.user.id]);
	
	if (like.length) 
	{
		like = like[0];
		if (like.liked == req.user.id && like.matched == 0){
			var link = `${req.protocol}://${req.get('host')}/inbox`;
			var message = `Hi there, this is the begining an awesome frienship with ${req.user.username}, you can now chat!`;
			var chat = connection.query('INSERT INTO chats(sender, receiver) VALUES(?, ?);', [req.user.id, id]);

			connection.query('INSERT INTO messages(sender, receiver, chat_id, message) VALUES(?, ?, ?, ?);', [req.user.id, id, chat.insertId, message]);
			connection.query('UPDATE likes SET matched=? WHERE liked=? AND liker=?', [1, req.user.id, id]);
			newNotification(req.user.id, id, 3, message, link.toString());

			return res.send({return: 1});
		}

		if (like.matched == 1)
		{
			var message = `You have been unmatched by ${req.user.username}`;
			var link = `${req.protocol}://${req.get('host')}/home`;
			newNotification(req.user.id, id, 2, message, link);
			connection.query('UPDATE likes SET matched=? WHERE id=?', [0, like.id]);

			return res.send({return: 0});
		}
	}
	else
	{
		
		like = connection.query('INSERT INTO likes(liker, liked, username) VALUES(?, ?, ?);', [req.user.id, id, req.user.username]);
		let message = `${req.user.username} liked your profile!`;
		let link = `${req.protocol}://${req.get('host')}/user/${req.user.id}`;
		let notification = newNotification(req.user.id, id, 2, message, link);

		return res.send({return: 1});
	}
	return res.json(like);

}

function newNotification(sender, receiver, type,  message, link)
{
	connection.query('INSERT INTO notifications(sender, receiver, message, link, type) VALUES(?, ?, ?, ?, ?);', [sender, receiver, message, link, type]);
}
