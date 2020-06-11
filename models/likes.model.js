const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var likesSchema = new mongoose.Schema({

    userId1:
	 {
        type: Schema.ObjectId,
        required: true
    },
    userId2:
	 {
        type: Schema.ObjectId,
        required: true
    },
	match: {
		type: Number,
		default: 0
	},
    timestamp:
	{
        type: Date,
		default: Date.now
    }

});

module.exports = mongoose.model('Likes', likesSchema);
