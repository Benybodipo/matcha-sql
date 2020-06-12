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
// connection.query(schemas.interests);
// connection.query(schemas.user_interests);


// const interests = [
// 	{name: 'Movies', class: 'fas fa-film'},
// 	{name: 'Art', class: 'fas fa-palette'},
// 	{name: 'Food',class: 'fas fa-utensils'},
// 	{name: 'Travel', class: 'fas fa-plane-departure'},
// 	{name: 'Sports', class: 'far fa-futbol'},
// 	{name: 'Nusic', class: 'fas fa-music'},
// 	{name: 'Hiking', class: 'fas fa-mountain'},
// 	{name: 'Books', class: 'fas fa-book'}
// ];

// for (let index = 0; index < interests.length; index++) {
// 	const interest = interests[index];
// 	let success = connection.query('SELECT * FROM interests WHERE name=? AND class=?;', [interest.name, interest.class]);
// 	if (!success.length){
// 		let success = connection.query('INSERT INTO interests(name, class) VALUES(?, ?);', [interest.name, interest.class]);
// 		console.log(success);
// 	}
// }

module.exports = connection;
