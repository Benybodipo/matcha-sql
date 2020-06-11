const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var messagesSchema = new mongoose.Schema({

    chatId:
	 {
        type: Schema.ObjectId,
        required: true
    },
    sender:
	 {
        type: Schema.ObjectId,
        required: true
    },
    receiver:
	{
        type: Schema.ObjectId,
        required: true
    },
	message:
	{
		type: String,
		required: true
	},
	read:
	{
		type: Boolean,
		default: false
	},
    timestamp:
	{
        type: Date,
		default: Date.now
    }

});

module.exports = mongoose.model('Messages', messagesSchema);
