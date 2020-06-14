const Users 	  = require('../models/users.model');
const Notifications 	  = require('../models/notifications.model');
const mongoose 	= require('mongoose');
const connection = require('../config/connection');

module.exports.index = function(req, res)
{
    var content = {
        title: "Matcha | Notifications",
        css: ["notifications"]
    };
    const notifications = connection.query(`SELECT  notifications.id, notifications._read, DATE_FORMAT(sent_at, "%b %d %Y") AS sent_at, SUBSTRING(notifications.message, 1, 50) AS message, notifications.link, users.username, images.image
    FROM notifications 
    LEFT JOIN users ON notifications.receiver=users.id 
    LEFT JOIN images ON notifications.receiver=images.user_id 
    WHERE receiver=?;`, [req.user.id]);

    content.notifications = notifications;
    content.count = notifications.length;
    
    return res.render('notifications', content);
}

module.exports.single = function(req, res)
{
    var content = {
        title: "Matcha | Notifications",
        css: ["notifications"],
        js: ["notifications"],
        isSingle: true
    };

    const notification = connection.query(`SELECT  notifications.*, DATE_FORMAT(sent_at, "%b %d %Y") AS sent_at, users.username, images.image
    FROM notifications 
    LEFT JOIN users ON notifications.receiver=users.id 
    LEFT JOIN images ON notifications.receiver=images.user_id 
    WHERE notifications.id=? AND notifications.receiver=?;`, [req.params.id, req.user.id]);
    
    if (notification.length)
    {
        if (!notification[0]._read)
            connection.query('UPDATE notifications SET _read=? WHERE id=?', [1, req.params.id]);
        content.notification = notification[0];

        return res.render('notifications', content);
    }
    return res.redirect('/notifications');
}

module.exports.markAllAsRead = function(req, res)
{
    let ids = JSON.parse(req.body.ids);

    for (let index = 0; index < ids.length; index++) {
        connection.query('UPDATE notifications SET _read=? WHERE id=?;', [1, ids[index]])
    }
    return res.redirect('/notifications')
}

module.exports.delete = function(req, res)
{
    connection.query('DELETE FROM notifications WHERE id=?;', [req.params.id]);
    return res.redirect('/notifications');
}

module.exports.deleteAll = function(req, res)
{
    let ids = JSON.parse(req.body.ids);

    for (let index = 0; index < ids.length; index++) {
        connection.query('DELETE FROM notifications WHERE id=?;', [ids[index]])
    }
    return res.redirect('/notifications')
}

module.exports.getAll = function (req, res)
{
    const notifications = connection.query('SELECT * FROM notifications WHERE receiver=? AND _read=?;', [req.user.id, 0]);
    return res.json(notifications);
}