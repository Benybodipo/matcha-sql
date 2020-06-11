const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var notificationsSchema = new mongoose.Schema({

	destination:
	{
		type: Schema.Types.ObjectId,
		required: true
	},
	origin:
	{
		type: Schema.Types.ObjectId,
		required: true
	},
    message:
	{
        type: Object,
        required: true
    },
    link:
	{
        type: Object,
        required: true
    },
	type:
	{
		type: Number,
        required: true
	},
	status:
	{
		type: Number,
		required: true,
		default: 0
	},
	timestamp:
	{
        type: Date,
		default: Date.now
    }

});

module.exports = mongoose.model('Notifications', notificationsSchema);
