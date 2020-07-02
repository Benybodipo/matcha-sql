const mysql = require('mysql');
const util = require( 'util' );
const schemas = require('../models/schemas');
const MySql = require('sync-mysql');
const faker = require('faker');
const bcrypt 		 = require('bcryptjs');

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
// connection.query(schemas.visits);
// connection.query(schemas.block_list);


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

let gender = ['male', 'female'];
let count = 500; //Seeding the database number of user accounts

count = 0;

for (i=0; i < 2; i++)
{
	hashPassword('Abc@123').then((password) => {
		let user = {
			firstname: faker.name.findName(),
			lastname: faker.name.lastName(),
			username: (faker.name.suffix() + faker.name.lastName()).toLocaleLowerCase(),
			email: faker.internet.email(),
			password: password,
			gender: gender[getRandomInt(2)],
			birthday: `2000-10-30`
		}

		if (connection.query(`SELECT * FROM users WHERE username=? OR email=?;`, [user.username, user.email]).length)
			i--;
		else
		{
			let sql = "INSERT INTO users(first_name, last_name, username, email, password, gender, birthday) VALUES(?, ?, ?, ?, ?, ?, ?);";
			let params = [user.firstname, user.lastname, user.username, user.email, user.password, user.gender, user.birthday];
			user = connection.query(sql, params);
		}
	})
	
}

module.exports = connection;
async function hashPassword (password) {
	const saltRounds = 10;
  
	const hashedPassword = await new Promise((resolve, reject) => {
	  bcrypt.hash(password, saltRounds, function(err, hash) {
		if (err) reject(err)
		resolve(hash)
	  });
	})
  
	return hashedPassword
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}