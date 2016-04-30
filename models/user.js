var mongoose = require('mongoose'),
	Schema = mongoose.Schema
var bcrypt = require('bcryptjs');

var UserSchema = new Schema({
	password            : {
		type        : String
	},
	email :{
		type : String
	},
	name:{
		type: String
	},
	facebook         : {
		id           : String,
		token        : String,
		email        : String,
		name         : String
	},
	twitter          : {
		id           : String,
		token        : String,
		displayName  : String,
		username     : String
	},
	google           : {
		id           : String,
		token        : String,
		email        : String,
		name         : String
	},


	//save messages from order user
	message_rec      : [{
		user_send    : String,
		message      : [{text:String, read:{type:Boolean, default: false}, date:{type: Date, default: Date.now }}]
	}],

	//save messages sended to order user
	message_send     : [{
		user_send    : String,
		message        : [{text:String, date:{type: Date, default: Date.now }}]
	}],
	// save list friend
	friendship       : [{
		email        : String,
	}]


});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			newUser.save(callback);
		});
	});
}


module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		if(err) throw err;
		callback(null, isMatch);
	});
}

module.exports.getUserByEmail = function(email, callback){
	User.findOne(email, callback);
}
module.exports.updateFriendShip = function(email, callback){
	User.update(email, callback);
}
