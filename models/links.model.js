const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var linksSchema = new mongoose.Schema({

    userid:
	 {
        type: Schema.ObjectId,
        required: true
    },
    token:
	 {
        type: String,
        required: true
    },
    type:
	 {
        type: Number,
		  min: 1,
		  max: 1,
        required: true
    }

});

module.exports = mongoose.model('Links', linksSchema);
