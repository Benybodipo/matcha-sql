const connection = require('../config/connection');

module.exports.page = function(req, res)
{
	var content = {
		title: "Matcha | My Inbox",
		css: ["chat", "inbox"],
		js: ["chat"],
		isInbox: true
	};

	let sql = `SELECT users.username, users.id, chats.id, messages.message, messages.sent_at, images.image, images.user_id
				FROM users 
				LEFT JOIN chats ON (users.id=chats.sender OR users.id=chats.receiver)
				LEFT JOIN messages ON (users.id=messages.sender OR users.id=messages.receiver)
				LEFT JOIN images ON (users.id=images.user_id OR users.id=images.user_id)
				WHERE (messages.sender=? OR messages.receiver=?) AND users.id!=? AND images.is_profile_picture=? ORDER BY messages.sent_at DESC LIMIT 1;`;;
	const chats = connection.query(sql, [req.user.id, req.user.id,  req.user.id, 1]);

	if (req.query.getAllMessages == "true")
		return res.json({latestChats: chats});
	content.chats = chats;
	
	return res.render("inbox", content);
	
}

/*============================================
	- GET ALL MESSAGES FROM SPECIFIC CHAT
============================================*/

module.exports.getMessages = function(req, res)
{ 
	const id = req.params.receiver;
	const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
	const messages = connection.query('SELECT * FROM messages WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)', [req.user.id, id, id, req.user.id]);
	
	res.json(messages);
	connection.query('UPDATE messages SET _read=?, read_at=? WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)', [1, now, req.user.id, id, id, req.user.id])
}

/*============================
	- SEND MESSAGE
============================*/
module.exports.chat = function(req, res)
{
	const {message, receiver, chat_id} = req.body;
	const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
	const chat = connection.query('SELECT * FROM chats WHERE id=?;', [chat_id]);
	let query = null;

	if (chat.length){
		query = connection.query('INSERT INTO messages(sender, receiver, chat_id, message) VALUES(?, ?, ?, ?)', [req.user.id, receiver, chat_id, message]);
		connection.query('UPDATE chats SET timestamp=? WHERE id=?', [now, chat_id])
	}
	else
	{
		query = connection.query('INSERT INTO chats(sender, receiver) VALUES(?, ?);', [req.user.id, receiver]);
		query = connection.query('INSERT INTO messages(sender, receiver, chat_id, message) VALUES(?, ?, ?, ?)', [req.user.id, receiver, query.insertId, message]);
	}
}

/*============================
	- GET ALL MATCHES
============================*/
module.exports.fans = function (req, res){

	var content = {
		title: "Matcha | Fans",
		css: ["chat", "inbox"],
		isInbox: true
	};
	const sql = `SELECT users.*, likes.*, images.*
				FROM users 
				LEFT JOIN likes ON users.id=likes.liker
				LEFT JOIN images ON users.id=images.user_id
				WHERE likes.liked=? AND likes.matched=? AND images.is_profile_picture=?;`;
	let fans = connection.query(sql, [req.user.id, 0, 1]);

	content.fans = fans;
	content.isEmpty = (!fans.length) ? true : false;
	
	return res.render('fans', fans);
}
/*============================
	- GET ALL MATCHES
============================*/
module.exports.matches = function (req, res){
	const sql = `SELECT users.*, likes.*, images.*
				FROM users 
				LEFT JOIN likes ON (users.id=likes.liker OR users.id=likes.liked)
				LEFT JOIN images ON (users.id=images.user_id OR users.id=images.user_id)
				WHERE (likes.liked=? OR likes.liker=?) AND likes.matched=? AND images.is_profile_picture=?;`;
	let matches = connection.query(sql, [req.user.id, req.user.id, 1, 1]);

	matches = matches.filter((match) => {
		return (match.user_id != req.user.id)
	});

	var content = {
		title: "Matcha | Matches",
		css: ["chat", "inbox"],
		// js: ["chat"],
		isInbox: true,
		matches: matches,
		isEmpty: (!matches.length) ? true : false
	};

	return res.render("matches", content); 
}
/*============================
	- GET ALL VISITORS
============================*/
module.exports.visitors = function (req, res){
	let content = {
		title: "Matcha | Visitors",
		css: ["chat", "inbox"],
		isInbox: true
	};

	const sql = `SELECT users.*, visits.*, images.*
				FROM users 
				LEFT JOIN visits ON users.id=visits.visitor_id
				LEFT JOIN images ON users.id=images.user_id
				WHERE visits.visited_id=? AND images.is_profile_picture=?;`;

	let visitors = connection.query(sql, [req.user.id, 1]);
	
	content.visitors =  visitors;
	content.isEmpty =  (!visitors.length) ? true : false;

	return res.render("views", content); 
}