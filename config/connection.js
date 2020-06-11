const mysql = require('mysql');
const util = require( 'util' );
const schemas = require('../models/schemas');
const MySql = require('sync-mysql');

const connection = new MySql({
	host: 'localhost',
	user: 'root',
	password: '', 
	multipleStatements: true,
	database: 'matcha'
});


// connection.query(schemas.db);
// connection.query('USE matcha;');
// connection.query(schemas.users);
// connection.query(schemas.images);
// connection.query(schemas.chats);
// connection.query(schemas.likes);
// connection.query(schemas.links);
// connection.query(schemas.messages);
// connection.query(schemas.notifications);
// connection.query(schemas.preferences);

module.exports = connection;
