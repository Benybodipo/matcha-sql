const mysql = require('mysql');
const util = require( 'util' );
const schemas = require('./models/schemas');
const MySql = require('sync-mysql');
const faker = require('faker');
const bcrypt 		 = require('bcryptjs');

const connection = new MySql({
	host: 'localhost',
	user: 'root',
	password: 'root', 
	multipleStatements: true
});

let dbExists = connection.query(`SHOW DATABASES LIKE 'matcha';`)
let success = 0
if (dbExists.length == 0)
{
	while (!success)
	{
		success = connection.query(schemas.db).affectedRows;
	}
	console.log("Database Matcha created..");
}

// // Connect to the DB 'matcha'
connection.query(`USE matcha;`);
if (connection.query(`SELECT DATABASE()`).length);
{
	console.log('Using MatchaDB...'); 
	connection.query(schemas.users);
	console.log('Users table creaed!'); 
	connection.query(schemas.images);
	console.log('Images table creaed!');
	connection.query(schemas.chats);
	console.log('Chats table creaed!');
	connection.query(schemas.likes);
	console.log('Likes table creaed!');
	connection.query(schemas.links);
	console.log('Links table creaed!');
	connection.query(schemas.messages);
	console.log('Messages table creaed!');
	connection.query(schemas.notifications);
	console.log('Notifications table creaed!');
	connection.query(schemas.preferences);
	console.log('Preferences table creaed!');
	connection.query(schemas.interests);
	console.log('Interests table creaed!');
	connection.query(schemas.user_interests);
	console.log('User Interests table creaed!');
	connection.query(schemas.visits);
	console.log('Visits table creaed!');
	connection.query(schemas.block_list);
	console.log('Blocked List table creaed!');
	
	console.log('All tables created successfully!');

}

console.log("Seeding interests table...");
const interests = [
	{name: 'Movies', class: 'fas fa-film'},
	{name: 'Art', class: 'fas fa-palette'},
	{name: 'Food',class: 'fas fa-utensils'},
	{name: 'Travel', class: 'fas fa-plane-departure'},
	{name: 'Sports', class: 'far fa-futbol'},
	{name: 'Nusic', class: 'fas fa-music'},
	{name: 'Hiking', class: 'fas fa-mountain'},
	{name: 'Books', class: 'fas fa-book'}
];

for (let index = 0; index < interests.length; index++) {
	const interest = interests[index];
	let success = connection.query('SELECT * FROM interests WHERE name=? AND class=?;', [interest.name, interest.class]);
	if (!success.length){
		let success = connection.query('INSERT INTO interests(name, class) VALUES(?, ?);', [interest.name, interest.class]);
	}
}
console.log("Interests table seeding completed...");


let gender = ['male', 'female'];
let count = 150; //Seeding the database number of user accounts


console.log("Seeding users table...");
process.stdout.write(`Seeding: 0%\r`);
let x = 0
for (i=0; i < count; i++)
{
	hashPassword('Abc@123').then((password) => {
		let birthdate = faker.date.between('1920-01-01', '2001-12-31').toISOString().split('T')[0];
					
		let user = {
			firstname: faker.name.findName(),
			lastname: faker.name.lastName(),
			username: (faker.name.suffix() + faker.name.lastName()).toLocaleLowerCase(),
			email: faker.internet.email(),
			password: password,
			gender: gender[getRandomInt(2)],
			birthday: birthdate,
			bio: faker.lorem.paragraph(),
			active: 1,
		}

		if (connection.query(`SELECT * FROM users WHERE username=? OR email=?;`, [user.username, user.email]).length)
			i--;
		else
		{
			let sql = "INSERT INTO users(first_name, last_name, username, email, password, gender, birthday, active, bio) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);";
			let params = [user.firstname, user.lastname, user.username, user.email, user.password, user.gender, user.birthday, user.active, user.bio];
			user = connection.query(sql, params);
			let id = user.insertId;

			let gender = (user.gender == "male") ? 2 : 1;
			let img = (user.gender == "male") ? "/img/male.png" : "/img/female.jpeg";

			connection.query("INSERT INTO images(user_id, image, is_profile_picture) VALUES(?, ?, ?);", [id, img, 1])
			connection.query("INSERT INTO preferences(user_id, gender, distance, min_age, max_age) VALUES(?, ?, ?, ?, ?);", [id, gender, 50, 18, 50]);
			connection.query('INSERT INTO user_interests(user_id, interest_id, active) VALUES(?, ?, ?);', [id, between(1, 8), 1]); 
		}
		x++;

		let progress = Math.round((100 * x)/count)
		process.stdout.write(`\r`);
		process.stdout.write(`Seeding: ${progress.toString()}%\r`);
		
		if (x == count)
		{
			console.log();
			console.log("Installation completed!");
			console.log("To run server type 'npm start'");
		}
	})
}

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

function between(min, max) {
	return Math.floor(
		Math.random() * (max - min) +  min
	);
}