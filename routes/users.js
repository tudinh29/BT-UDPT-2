var express = require('express');
var router = express.Router();
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
router.get('/index', function(req, res, next) {
	res.render('index',{
		'title': 'Message'
	})
});

router.get('/friend', function(req, res, next) {
	res.render('friend',{
		'title': 'Friend'
	})
});

router.post('/friend',function(req,res,next){

	var email = req.body.email;
	console.log(req.user);
	req.checkBody('email', 'email field is require').notEmpty();
	req.checkBody('email', 'email not valid').isEmail();
	
	var errors = req.validationErrors();
	if(errors){
		res.render('friend', { errors:errors});
	}else{
		if (email == req.user.email)
		{
			req.checkBody('email', 'Không thể kết bạn chính mình').equals('a');
			errors = req.validationErrors();
			res.render('friend', { errors:errors});
		}
		else {
			var userQuery = User.findOne({email: email}).exec(); //tim email voi tham so truyen vao la email
			userQuery.addBack(function (err, user) {
				if (!!user) {
					var dem = 0;
					for (var i = 0; i < req.user.friendship.length; i++) // truy xuat bang friend trong database
					{
						if (req.user.friendship[i].email == email) {
							dem++;
							break;
						}
					}
					if (dem == 0) {
						//them email vao trong danh sach ban be
						User.findByIdAndUpdate(
							req.user._id,
							{$push: {"friendship": {email: email}}},
							{safe: true, upsert: true, new: true},
							function (err, user) {
								req.user = user;
							});
						res.redirect('friend');
					} else {
						req.checkBody('email', 'Email này đã có trong danh sách bạn bè').equals('a');
						errors = req.validationErrors();
						res.render('friend', {errors: errors});
					}

				}
				else {
					req.checkBody('email', 'Email không tồn tại').equals('a');
					errors = req.validationErrors();
					res.render('friend', {errors: errors});
				}

			});
		}
	}
});
// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var userQuery = User.findOne({ email: req.body.email }).exec();
		userQuery.addBack(function(err, user) {
			if(!!user) {
				req.checkBody('email', 'Email đã tồn tại').equals('a');
				errors = req.validationErrors();
				res.render('register', {errors:errors});
			}
			else
			{
				var newUser = new User({
					name: name,
					email:email,
					password: password
				});

				User.createUser(newUser, function(err, user){
					if(err) throw err;
				});

				req.flash('success_msg', 'Đăng kí thành công');

				res.redirect('/users/login');
			}
		});
		
	}
});

passport.use(new LocalStrategy(
	function(email, password, done) {
		
			var userQuery = User.findOne({ email: email }).exec();
			userQuery.addBack(function(err, user) {
				if (!!user) {
					User.comparePassword(password, user.password, function(err, isMatch){
						if(err) throw err;
						if(isMatch){
							return done(null, user);
						} else {
							return done(null, false, {message: 'Password sai !!'});
						}
						res.redirect('index');
					});
				}
				else{
					return done(null, false, {message: 'Email không tồn tại'});
				}
			});
		
	}));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local', {successRedirect:'/users/index', failureRedirect:'/users/login',failureFlash: true}),
	function(req, res) {
		res.redirect('/');
	});

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;