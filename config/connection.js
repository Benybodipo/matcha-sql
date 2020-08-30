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