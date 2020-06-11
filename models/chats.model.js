const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var chatsSchema = new mongoose.Schema({

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
    timestamp:
	{
        type: Date,
		default: Date.now
    }

});

module.exports = mongoose.model('Chats', chatsSchema);
