const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var visitsSchema = new mongoose.Schema({

    userId:
	{
        type: Object,
        required: true
    },
    visitorId:
	{
        type: Object,
        required: true
    },
	timestamp:
	{
        type: Date,
		default: Date.now
    }

});

module.exports = mongoose.model('Visits', visitsSchema);
