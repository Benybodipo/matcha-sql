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

		if (req.body.action == "update-preferences")
		{
			var prefObj = {
				gender: req.body.gender,
				distance: req.body.distance,
				visible: req.body.visible,
				interests: JSON.parse(req.body.interests),
				ages: JSON.parse(req.body.ages)
			};

			var preferences = new Preferences(prefObj);

			Users.findOne({_id: userid}, function(err, user){
					if (!user)
						prefObj._id = userid;

					Users.updateOne({_id: userid}, {preferences: prefObj}, {upsert: true, safe: false}, function(err, x, z){
						if (err)
							console.log(err);
						else
							console.log("success");
					});

			});
		}
		else if(req.body.action == "update-info")
		{
			var pos = req.body.position,
				 img = req.body.img,
				 field = req.body.field,
				 value = req.body.value;

			if (img)
			{
				var imageObj = JSON.parse('{"images.'+pos+'": "'+img+'"}');
				Users.updateOne({_id: userid}, {$set: imageObj}, function(err, result){
					if (err) throw err;
					res.json(result);
				});
			}
			else
			{
				var infoObj = JSON.parse('{"'+field+'": "'+value+'"}');
				var errors = [];

				if (field == "username")
				{
					req.check("value", "Username too short").notEmpty().isLength({ min: 3 });
					errors = req.validationErrors();

					if (errors)
						res.json(errors[0].msg);
					else
					{
						Users.find(infoObj, function(err, result){
							if (err) throw err;
							if (result.length >= 1)
								res.json("Username already in use");
							else
								updateInfo(res, infoObj, userid);
						});
					}
				}
				else if (field == "email")
				{
					req.check("value", "Invalid e-mail").isEmail().normalizeEmail();
					errors = req.validationErrors();

					if (errors)
						res.json(errors[0].msg);
					else
					{
						Users.find(infoObj, function(err, result){
							if (err) throw err;
							if (result.length >= 1)
								res.json("Email already in use");
							else
								updateInfo(res, infoObj, userid);
						});
					}
				}
				else if (field == "confirm-password")
				{
					req.check("value", "Unsecure Password").isLength({ min: 6});
					errors = req.validationErrors();

					if (errors)
						res.json(errors[0].msg);
					else
					{
						bcrypt.genSalt(10, function(err, salt){
							if (err) throw err;
							bcrypt.hash(value, salt, function(err, hash)
							{
								var infoObj = JSON.parse('{"password": "'+hash+'"}');
								updateInfo(res, infoObj, userid);
							});
						});
					}
				}
				else
				{

					updateInfo(res, infoObj, userid);
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
