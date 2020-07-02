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
	req.check("gender").notEmpty();
	req.check("password").isLength({ min: 6 });
	req.check("password2", "Password don't match").isLength({ min: 6}).equals(req.body.password);
	

	var errors = req.validationErrors();
	
	if (errors)
	{	
		req.flash('error', errors);
		req.flash('inputs', req.body);
		console.log(errors);
		
		
		return res.redirect("/");
	}
	else
	{
		let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		months = months.indexOf(req.body.month) + 1;
		months = (months < 10) ? `0${months}`: months;
		const {firstname, lastname, username, email, password, gender} = req.body;
		const birthdate = `${req.body.year}-${months}-${req.body.day}`;
		

		let user = connection.query('SELECT * FROM users WHERE username=? OR email=?', [username, email]);
		if (!user.length)
		{
			hashPassword(password).then((password) => {
				// Register new user
				let sql = "INSERT INTO users(first_name, last_name, username, email, password, gender, birthday) VALUES(?, ?, ?, ?, ?, ?, ?);";

				user = connection.query(sql, [firstname, lastname, username, req.body.email, password, gender, birthdate]);
				if (user)
				{
					const id = user.insertId;
					let token = new TokenGenerator(256, TokenGenerator.BASE62);

					//Insert confirmation link
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
							req.flash('success', 'You have successfully registered. Please check out you email inbox for the activation link.');
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
			var errors = [];
			
			if (user[0].email && user[0].email == req.body.email)
				errors.push({param: 'email', msg: 'Email address already in use.'})
			if (user[0].username && user[0].username == req.body.username)
				errors.push({param: 'username', msg: 'Username already in use.'});

			req.flash('error', errors);
			req.flash('inputs', req.body);
			
			return res.redirect('/');
		}
	}
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
		else if(action == "delete-account")
		{
			// connection.query('DELETE users WHERE id=?;', [req.user.id]);
			// req.logout;
			// req.session.destroy();
			return res.json({action: 'Delete account!'});
		}
		console.log(req.body);
		
}

/*============================
		- UPDATE PROFILE
============================*/
module.exports.forgotPassword = (req, res) => {
	var content = {
		title: "Matcha | Forgot Password",
		css: ["home"],
		errors: null,
	};
	content.inputs = (req.session.flash.inputs) ? req.session.flash.inputs[0] : {};
	

	if (req.method == 'GET')
		return res.render('forgot-password', content);
	else if (req.method == 'POST' )
	{
		req.check("email", "Invalid email address format").notEmpty().isEmail().normalizeEmail();
		var errors = req.validationErrors();
		
		if (errors)
		{
			req.flash('error', errors);
			req.flash('inputs', req.body);
			res.redirect("/forgot-password");
		}
		else
		{
			// 3. Render login page with flash message
			let sql = 'SELECT id FROM users WHERE email=?;';
			let select = connection.query(sql, [req.body.email]);
			
			if (select.length)
			{
				let {id} = select[0];
				let token = new TokenGenerator(256, TokenGenerator.BASE62);
				let insert = connection.query('INSERT INTO links(user_id, token, type) VALUES(?, ?, ?);', [id, token.generate(), 2]);
	
				if (insert.insertId)
				{
					var transporter = nodemailer.createTransport(mail.credentials);
					var email = {
						to: "benybodipo@gmail.com",
						sbj: "RESET PASSWORD",
						msj: `<a href='${req.protocol}://${req.get('host')}/reset-password/${id}/${token.generate()}/2'>Click here</a> to reset your password`
					};

					transporter.sendMail(mail.options(email.to, email.sbj, email.msj), function (err, info)
					{
						if (err) throw err;
					});
					req.flash('success', 'Request successfully sent. Please check out you email inbox.');
					return res.redirect('/login');
				}
			}
			else{
				req.flash('error', {msg: "Email Address not fount."});
				req.flash('inputs', req.body);
				res.redirect("/forgot-password");
			}
		}
	}
		
}

module.exports.resetPassword = (req, res) => {

	var content = {
		title: "Matcha | Reset Password",
		css: ["home"],
		errors: null,
		success: null
	};
	let {user_id, token, type} = req.params;

	if (req.method == 'GET'){
		if (user_id && token && type)
		{
			let link = connection.query('SELECT id FROM links WHERE user_id=? AND token=? AND type=?', [user_id, token, type]);

			if (link.length){
				content.url = req.url;
				content.link_id = link[0].id;
				content.user_id = user_id;
				return res.render('reset-password', content);
			}
			else
				return res.json('We have to redirect back with flash message!')
		}
		else
			return res.json('We have to redirect back with flash message!')
	}
	else if (req.method == 'POST')
	{
		if ( req.body.password && req.body.confirm_password)
		{
			req.check("password").isLength({ min: 6 });
			req.check("confirm_password", "Password don't match").equals(req.body.password);

			let errors = req.validationErrors();
			
			if (errors)
			{
				content.errors = errors;
				return res.redirect(req.body.url);
			}
			else
			{
				hashPassword(req.body.password).then((password) => {
					let sql = `UPDATE users SET password=? WHERE id=?; SELECT username FROM users WHERE id=?;`
					let query = connection.query(sql, [password, req.body.user_id, req.body.user_id]);

					if (query[0].affectedRows)
					{
						connection.query('DELETE FROM links WHERE id=?;', [req.body.link_id]);
						return res.redirect(`/login/${query[1][0].username}`) // With flash message (Password successfully reseted, please enter password for login);
					}
				}).catch((err) => {
					return console.log(err);
				});
			}
		}
		else
			return res.redirect(req.body.url) //With flash message (You cnat submit empty inputs)
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
