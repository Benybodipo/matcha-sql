const Users 		 = require('../models/users.model');
const Links 		 = require('../models/links.model');
const Preferences 	 = require('../models/preferences.model');
const connection 	 = require('../config/connection');
const bcrypt 		 = require('bcryptjs');
const passport 		 = require('passport');
const nodemailer 	 = require('nodemailer');
const mail 			 = require("../config/nodemailer");
const TokenGenerator = require('uuid-token-generator');
require('../config/passport')(passport);

/*============================
		- REGISTER
============================*/
module.exports.register = function(req, res) {
	var content = {
		title: "Matcha | Welcome",
		css: ["home"],
		js: ["slider"],
		errors: null,
		success: null
	};

	req.check("firstname", "First name too short").notEmpty().isLength({ min: 3 });
	req.check("lastname", "Last name too short").notEmpty().isLength({min: 3});
	req.check("username", "Username too short").notEmpty().isLength({ min: 3 });
	req.check("email", "Invalid e-mail").isEmail().normalizeEmail();
	req.check("password").isLength({ min: 6 });
	req.check("password2", "Password don't match").isLength({ min: 6}).equals(req.body.password);

	var errors = req.validationErrors();

	if (errors)
	{
		content.errors = errors;
		res.render("index", content);
	}
	else
	{
		const {firstname, lastname, username, email, password, gender} = req.body;
		const birthdate = `${req.body.month} ${req.body.day} ,${req.body.year}`;
		

		let user = connection.query('SELECT * FROM users WHERE username=? OR email=?', [username, email]);
		if (!user.length)
		{
			hashPassword(password).then((password) => {
				let sql = "INSERT INTO users(first_name, last_name, username, email, password, gender, birthday) VALUES(?, ?, ?, ?, ?, ?, ?);";

				user = connection.query(sql, [firstname, lastname, username, req.body.email, password, gender, '2000-05-05']);
				if (user)
				{
					const id = user.insertId;
					let token = new TokenGenerator(256, TokenGenerator.BASE62);

					sql = 'INSERT INTO links(user_id, token, type) VALUES(?, ?, ?);';
					insert = connection.query(sql, [id, token.generate(), 1]);

					if (insert)
					{
						var transporter = nodemailer.createTransport(mail.credentials);
						var email = {
							to: "benybodipo@gmail.com",
							sbj: "ACCOUNT ACTIVATION",
							msj: `Follow the link <a href='http://localhost:7500/login/${username}/${id}/${token}/1'>CLICK</a>`
						};

						transporter.sendMail(mail.options(email.to, email.sbj, email.msj), function (err, info)
						{
							if (err) throw err;
							res.redirect('/login');
						});
					}
				}
			}).catch((err) => {
				console.log(err);
			});
		}
		else
		{
			if (user.email && user.email == obj.email)
				errors = "Email Address already in use";
			else if (user.username && user.username == obj.username)
				errors = "Username already in use";
			return res.json(errors);
		}
	}
}

function updateInfo(res, obj, userid)
{
	Users.updateOne({_id: userid}, {$set: obj}, function(err, result){
		if (err) throw err;
		res.json(result);
	});
}

/*============================
		- UPDATE PROFILE
============================*/
module.exports.profile = function(req, res) {
		var userid = req.user._id;
		const {action} = req.body;

		if (action === "update-preferences")
		{
			const interests = JSON.parse(req.body.interests);
			let query = null;
			delete req.body.interests; delete req.body.action;

			const preferences = Object.keys(req.body);

			// UPDATE PREFERENCES
			let stm = "UPDATE preferences SET ";
			let params = [];

			for (let index = 0; index < preferences.length; index++) 
			{
					var coma = (index + 1 < preferences.length) ? ', ' : ' WHERE user_id=?;';
					stm += `${preferences[index]}=?${coma} `;
					params.push(req.body[preferences[index]])
			}
			params.push(req.user.id);
			connection.query(stm, params);

			// UPDATE INTERESTS
			if (interests.length)
			{
				query = connection.query('UPDATE user_interests SET active=? WHERE user_id=?;', [0, req.user.id]);
				
				interests.forEach((id) => {
					query = connection.query('SELECT * FROM user_interests WHERE user_id=? AND interest_id=?;', [req.user.id, id]);
					
					if (query.length)
						quey = connection.query('UPDATE user_interests SET active=? WHERE user_id=? AND interest_id=?;', [1, req.user.id, id]);
					else
						query = connection.query('INSERT INTO user_interests(user_id, interest_id, active) VALUES(?, ?, ?);', [req.user.id, id, 1]);
				});
			}
			
			return res.json(query);
		}
		else if(action === "update-info")
		{	
			let {field, value} = req.body; 

			if (req.body.img)
			{ 
				connection.query('UPDATE images SET image=? WHERE user_id=? AND is_profile_picture=?;', [req.body.img, req.user.id, 1]);
				return res.json(req.body);
			}
			else
			{
				let query = null;
				let errors = [];

				if (field == 'confirm-password')
				{
					req.check("value", "Unsecure Password").isLength({ min: 6});
					errors = req.validationErrors();

					if (errors)
						return res.json(errors[0].msg);
					
					hashPassword(value).then((password) => { 
						query = connection.query(`UPDATE users SET password=?;`, [password]);
						return res.json(query);
					})
					.catch((err) => {
						console.log(err);
					});
				}
				else
				{
					if (field == 'usernname')
						req.check("value", "Username too short").notEmpty().isLength({ min: 3 });
					else if (field == 'email')
						req.check("value", "Invalid e-mail").isEmail().normalizeEmail();
					errors = req.validationErrors();
	
					if (errors)
						res.json(errors[0].msg);
					else
					{
						query = connection.query(`SELECT username FROM users WHERE ${field}=?;`, [value]);
	
						if (query.length)
							res.json(`${field} already in use`);
						else
						{
							query = connection.query(`UPDATE users SET ${field}=?;`, [value]);
							return res.json(query);
						}
					}
				}
			}
		}
		else if(req.body.action == "delete-account")
		{
			Users.deleteOne({_id: userid}, function(err, result){
				if (err) throw err;
				req.logout();
				req.session.destroy();
				res.json({success: 1});
			});

		}
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
