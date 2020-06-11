const Messages	= require('../models/messages.model');
const Chats		= require('../models/chats.model');
const Users 	= require('../models/users.model');
const Likes 	= require('../models/likes.model');
const Visits 	= require('../models/visits.model');
const mongoose 	= require('mongoose');

module.exports.page = function(req, res)
{
	var content = {
		title: "Matcha | My Inbox",
		css: ["chat", "inbox"],
		js: ["chat"],
		isInbox: true
	};

	var orStatement = [{sender: req.user._id}, {receiver: req.user._id}];

	Chats.find({$or: orStatement}, {_id: 1}, function(err, _chats){
		if (err)  throw err;
		
		if (_chats)
		{	
			Messages.find({chatId: {$in: _chats}}, function(err, messages){
				if (err) throw err;
				
				let ids = messages.map((msg) => {

					return (msg.sender.toString() === req.user.id) ? msg.receiver : msg.sender;
				});
				
				Users.find({_id: ids}, {_id: 1, images: 1, username: 1},  function(err, users){
					if (err) throw err;

					let tmpIds = [];
					let chats = messages.map((message) => {
						
						let user = users.find((user) => {
							let id  = (message.sender.toString() == req.user.id) ? message.receiver : message.sender;
	
							return (user.id == id);
						});
						
						let index = users.indexOf(user);
						if (index >= 0 )
						{
							if (!tmpIds.includes(user.id))
							{
								let tmp = JSON.parse(JSON.stringify(message));

								tmp.username = users[index].username;
								tmp.contact = users[index]._id;
								tmp.image = users[index].images[0];
								tmp.date = (new Date(tmp.timestamp)).toDateString();

								tmpIds.push(user.id);
								return tmp;
							}
						}
					});

					if (req.query.getAllMessages == "true")
						res.json({latestChats: chats});
					else{
						content.chats = chats;
						res.render("inbox", content);
					}
				});
			}).sort({timestamp: -1});
		}
	}).distinct('_id');
}

/*============================================
	- GET ALL MESSAGES FROM SPECIFIC CHAT
============================================*/

module.exports.getMessages = function(req, res)
{
	var receiver = req.params.receiver;
	var orStatement = [{sender: receiver, receiver: req.user._id}, {sender: req.user._id, receiver: receiver}];

	Messages.find({$or: orStatement}, function(err, messages){
		if (err) throw err;
		res.json(messages);
	}).sort({timestamp: 1});
}

/*============================
	- SEND MESSAGE
============================*/
module.exports.chat = function(req, res)
{
	const message = req.body.message,
		  receiver = req.body._id;
	var orStatement = [{sender: receiver, receiver: req.user._id}, {sender: req.user._id, receiver: receiver}];


	Chats.findOne({$or: orStatement}, function(err, chat){
		if (err) throw err;

		var message = {
			message: req.body.message,
			sender: req.user._id,
			receiver: mongoose.Types.ObjectId(receiver)
		};
		

		var newChat  = new Chats({
			sender: req.user._id,
			receiver: mongoose.Types.ObjectId(receiver)
		});

		if (chat)
		{
			Chats.updateOne({$or: orStatement}, {timestamp: new Date()}, function(err, chats){
				if (err) throw err;

				message.chatId = chat._id;
				var newMessage = new Messages(message);
				newMessage.save(function(err){
					if (err) throw err;
					console.log("update chats collection");
					res.json({"message": "Updated chat and new message sent"});
				})
			});
		}
		else
		{
			newChat.save(function(err){
				if (err) throw err;

				message.chatId = newChat._id;
				var newMessage = new Messages(message);

				newMessage.save(function(err){
					if (err) throw err;
					console.log("new chats collection");
					res.json({"message": "new chat and message sent"});
				});
			});

		}
	});
}

/*============================
	- GET ALL MATCHES
============================*/
module.exports.fans = function (req, res){
	Likes.find({userId1: req.user._id, match: 0}, function(err, likes){

		let like = likes.map(function (like) {
			return like.userId2;
		});

		Users.find({_id: like}, {_id: 1, images: 1, username: 1}, function (err, users) {
			if  (err) throw err;
			
			var content = {
				title: "Matcha | Fans",
				css: ["chat", "inbox"],
				isInbox: true,
				fans: users,
				isEmpty: (!users.length) ? true : false
			};

			res.render("fans", content); 
		})
	});
}
/*============================
	- GET ALL MATCHES
============================*/
module.exports.matches = function (req, res){
	Likes.find({
		$or: [{userId1: req.user._id}, {userId2: req.user._id}], 
		match: 1
	}, function(err, likes){

		let like = likes.map(function (like) {
			return (like.userId1 != req.user.id) ? like.userId1 : like.userId2;
		});

		Users.find({_id: like}, {_id: 1, images: 1, username: 1}, function (err, users) {
			if  (err) throw err;
			
			var content = {
				title: "Matcha | Matches",
				css: ["chat", "inbox"],
				// js: ["chat"],
				isInbox: true,
				matches: users,
				isEmpty: (!users.length) ? true : false
			};

			res.render("matches", content); 
		})
	});
}
/*============================
	- GET ALL VISITORS
============================*/
module.exports.visitors = function (req, res){
	Visits.find({userId: req.user.id}, function(err, visitors){

		let visits = visitors.map(function (visitor) {
			return visitor.visitorId;
		});

		Users.find({_id: visits}, {_id: 1, images: 1, username: 1}, function (err, users) {
			if  (err) throw err;
			
			var content = {
				title: "Matcha | Visitors",
				css: ["chat", "inbox"],
				isInbox: true,
				visitors: users,
				isEmpty: (!users.length) ? true : false
			};

			res.render("views", content); 
		})
	});
}