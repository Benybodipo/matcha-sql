const connection 		 = require("../config/connection");

module.exports.index = function(req, res){

    var content = {
        title: "Matcha | Notifications",
        css: ["notifications"]
    };
    
	let sql, params;
	sql = `SELECT * FROM users
		INNER JOIN images ON users.id=images.user_id
		INNER JOIN block_list ON users.id=block_list.account_id
		WHERE users.id!=?
		AND block_list.user_id=?
        AND images.is_profile_picture=1;`;

	params = [req.user.id, req.user.id];
    
    content.blockedList = connection.query(sql, params);
    content.count = (content.blockedList.length) ? true : false;
	
	return res.render('blocked-list', content);
}
module.exports.block_user = function(req, res){

	let select = connection.query('SELECT * FROM block_list WHERE user_id=? AND account_id=?;', [req.user.id, req.params.id]);
	
	if (!select.length)
		connection.query('INSERT INTO block_list(user_id, account_id) VALUES(?, ?);', [req.user.id, req.params.id])
	return res.redirect('/home');
}

module.exports.unblock_user = function(req, res) {

	let select = connection.query('SELECT * FROM block_list WHERE id=?;', [req.params.id]);

	if (select.length)
		connection.query('DELETE FROM block_list WHERE id=?;', [select[0].id])
	return res.redirect('/home');
}