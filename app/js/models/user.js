var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	firstname: String,
	lastname: String,
	username: String,
	password: String,
	birthdate: Date,
	email: String,
	weight: Number,
	length: Number,
	medication: [String],
	heartCondition: String,
	coffeine: Number,
	smoker: Boolean
});

module.exports = mongoose.model('User', UserSchema);