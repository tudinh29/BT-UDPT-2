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

	req.checkBody('email', 'email field is require').notEmpty();
	req.checkBody('email', 'email not valid').isEmail();
	if (email == infoUser.email)
	{
		req.checkBody('email', 'Không thể kết bạn chính mình').equals('a');
	}
	var errors = req.validationErrors();
	if(errors){
		res.render('friend', { flash: { type: 'alert-danger', messages: errors }});
	}else{
		var userQuery = User.findOne({ email: email }).exec(); //tim email voi tham so truyen vao la email
		userQuery.addBack(function(err, user) {
			if(!!user) {
				var dem = 0;
				for (var i =0; i< infoUser.friendship.length ; i++) // truy xuat bang friend trong database
				{
					if (infoUser.friendship[i].email == email)
					{
						dem ++;
						break;
					}
				}
				if ( dem == 0)
				{
					//them email vao trong danh sach ban be
					User.findByIdAndUpdate(
					infoUser._id,
					{$push: {"friendship": {email: email}}},
					{safe: true, upsert: true, new : true},
					function(err, user) {
						infoUser = user;
					});	
					res.redirect('friend');	
				} else {
					req.checkBody('email', 'Email này đã có trong danh sách bạn bè').equals('a');
					errors = req.validationErrors();
					res.render('friend', { flash: { type: 'alert-danger', messages: errors }});
				}
						
			}
			else
			{
				req.checkBody('email', 'Email không tồn tại').equals('a');
				errors = req.validationErrors();
				res.render('friend', { flash: { type: 'alert-danger', messages: errors }});
			}
			
		});
	}
});
router.post('/register', function(req, res, next){
	//get form values
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
					password: password,
				});
				
				//create user
				User.createUser(newUser, function(err, user){
					if(err) throw err;
				});
				
				
				req.flash('success','you are now registered and may log in');
				res.redirect('/');
			}
		});


	}

});


router.post('/login', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;

	req.checkBody('email', 'email field is require').notEmpty();
	req.checkBody('email', 'email not valid').isEmail();
	req.checkBody('password', 'password field is require').notEmpty();

	var errors = req.validationErrors();
	
	if(errors){
		res.render('login', { flash: { type: 'alert-danger', messages: errors }});

	}
	else {
			var userQuery = User.findOne({ email: req.body.email }).exec();
			userQuery.addBack(function(err, user) {
				if (!!user) {
					req.checkBody('password', 'Passwords is incorrect').equals(user.password);
					errors = req.validationErrors();
					if(errors){
						res.render('login', { flash: { type: 'alert-danger', messages: errors }});
					}
					else{
						infoUser = user;
						res.redirect('index');
					}
				}
				else{
					req.checkBody('email', 'Email or password incorrected').equals('a');
					errors = req.validationErrors();
					res.render('login', {flash: {type: 'alert-danger', messages: errors}});
				}
			});
		}
	});


router.get('/logout', function(req, res){
	req.logout();
	req.checkBody('password', 'Bạn đã đăng xuất').equals('0');
	var errors = req.validationErrors();
	infoUser = null;
	res.render('login', {flash: { type: 'alert-danger', messages: errors}});
});

module.exports = router;