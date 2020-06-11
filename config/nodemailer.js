const nodemailer = require('nodemailer');

/*
GMAIL
const credentials = {
	service: 'gmail',
	auth: {
		user: my@email.com,
		pass: secret
	},
	tls: {
		rejectUnauthorized: false
	},
	debug: true
};
*/

// MAILTRAP
const credentials = {
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "61d334b1536907",
		pass: "88190e9e4ff7d0"
	}
};

var options = function options(to, subject, message)
{
	var mailOptions = {
		from: '"Matcha" <matcha@info.com>',
		to: to,
		subject: subject,
		html: message
	};
	return mailOptions;
}

function dendMail(options)
{
	console.log(options);
}

module.exports = {
	credentials: credentials,
	options: options
}
