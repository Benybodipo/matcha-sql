const Users 	  = require('../models/users.model');
const Notifications 	  = require('../models/notifications.model');
const mongoose 	= require('mongoose');

module.exports.index = function(req, res)
{
    Notifications.find({destination: req.user._id}, function (err, notifications) {
        var content = {
            title: "Matcha | Notifications",
            css: ["notifications"],
            // js: ["notifications"]
        };

        let ids = notifications.map(function(notification){
            return (notification.origin)
        });

        Users.find({_id: {$in: ids}}, function (err, users){

            let data = notifications.map(function (notification){
                let user = users.find(function (user){
                    return (user.id == notification.origin);
                });

                let index = users.indexOf(user);
                if (index >= 0)
                {
                    let tmp = JSON.parse(JSON.stringify(notification));
                    tmp.username = users[index].username;
                    tmp.image = users[index].images[0];
                    tmp.date = (new Date(tmp.timestamp)).toDateString();
                    
                    return tmp;
                }
            });
            content.notifications = data;
            content.count = data.length;

            res.render('notifications', content);
        }); 
    });
}

module.exports.single = function(req, res)
{
    Notifications.findOne({_id: mongoose.Types.ObjectId(req.params.id) }, function (err, notification) {
        if (err) throw err;

        if (notification)
        {
            Users.findOne({_id: notification.origin}, function (err, user){
                if (err) throw err;

                if (user)
                {
                    let tmp = JSON.parse(JSON.stringify(notification));
                    tmp.username = user.username;
                    tmp.image = user.images[0];
                    tmp.date = (new Date(tmp.timestamp)).toDateString();

                    Notifications.updateOne({_id: req.params.id}, {$set: {status: 1}}, function (err, result){
                        var content = {
                            title: "Matcha | Notifications",
                            css: ["notifications"],
                            js: ["notifications"],
                            notification: tmp,
                            isSingle: true
                        };

                        res.render('notifications', content);
                    });
                }
                else
                    return res.redirect('/notifications');
            });
        }
        else
            return res.redirect('/notifications');
    });
}

module.exports.markAllAsRead = function(req, res)
{
    let ids = JSON.parse(req.body.ids);

    Notifications.updateMany({_id: {$in: ids}}, {status: 1}, function (err, success) {
        if (err) throw err;
        return res.redirect('/notifications')
    });
}

module.exports.delete = function(req, res)
{
    Notifications.remove({_id: req.params.id}, function (err, success) {
        if (err) throw err;
        return res.redirect('/notifications')
    });
}

module.exports.deleteAll = function(req, res)
{
    let ids = JSON.parse(req.body.ids);

    Notifications.remove({_id: {$in: ids}}, function (err, success) {
        if (err) throw err;
        return res.redirect('/notifications')
    });
}

module.exports.getAll = function (req, res)
{
    Notifications.find({destination: req.user._id, status: 0}, function(err, notifications){
		if (err) throw err;
		return res.json(notifications); 
	});
}