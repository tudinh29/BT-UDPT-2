var mongoose = require('mongoose'),
    Schema = mongoose.Schema
var bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost/udpt');
var UserSchema = new Schema({
    password: {
        type: String
    },
    email: {
        type: String
    },
    name:{
        type: String
    }

});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    /*bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });*/
    newUser.save(callback);
}

module.exports.getUserByEmail = function(email, callback){
    User.findOne(email, callback);
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