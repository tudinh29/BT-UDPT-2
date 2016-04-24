var express = require('express');
var router = express.Router()
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{
  	'title': 'Register1'
  })
});

router.get('/login', function(req, res, next) {
  res.render('login',{
  	'title': 'Login'
  })
});

router.post('/register', function(req, res, next){
	//get form values
	console.log(req.body);
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;


	// form validation
	req.checkBody('name', 'Name field is require').notEmpty();
	req.checkBody('email', 'email field is require').notEmpty();
	req.checkBody('email', 'email not valid').isEmail();
	req.checkBody('password', 'password field is require').notEmpty();
	req.checkBody('password2', 'passwords do not match').equals(req.body.password);

	//check for errors
	var errors = req.validationErrors();

	if(errors){
		res.render('register', { flash: { type: 'alert-danger', messages: errors }});
		console.log(errors);
		res.render('register',{
			errors:errors
		});
	} else {
		
		var userQuery = User.findOne({ email: req.body.email }).exec();
		userQuery.addBack(function(err, user) {
			if(!!user) {
				req.checkBody('email', 'Email exists').equals('a');
				errors = req.validationErrors();
				res.render('register', { flash: { type: 'alert-danger', messages: errors }});
			}
			else
			{
				var newUser = new User({
					name: name,
					email: email,
					password: password
				});

				//create user
				User.createUser(newUser, function(err, user){
					if(err) throw err;
					console.log(user);
				});

				req.flash('success','you are now registered and may log in');
				res.redirect('/');
			}
		});
	}
});


router.post('/login',
	passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
	function(req, res) {
		res.redirect('/');
	});

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;