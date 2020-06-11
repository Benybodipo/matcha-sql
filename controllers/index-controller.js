const TokenGenerator = require('uuid-token-generator');
module.exports = function(req, res)
{
	var currentTime =  new Date();
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var years = range((currentTime.getFullYear() - 167), (currentTime.getFullYear() - 18)).reverse();
	var days  = range(1, 31);
	var content = {
		title: "Matcha | Welcome",
		css: ["home"],
		js: ["slider"],
		layout: 'index',
		months: months,
		years: years,
		days: days
	};

	if (req.isAuthenticated())
		res.redirect("/home");
	else
		res.render('index', content);

	function range(start, end)
	{
		var numbers = [];

		for (var i = start; i <= end; i++)
		{
			numbers.push(i);
		}
		return numbers;
	}

}
