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
})

router.post('/index',function(req,res,next) {
	var mess_id = req.body.id;
	var datenow = new Date();
	var user_send = req.body.user_send;
	var read = req.body.read;
	var mess = req.body.message;
	var mess_id_send = req.body.mess_id_send;
	User.update(
			{_id : req.user._id , "message_rec._id" : mess_id},
			{$set: { "message_rec.$.read" : true ,"message_rec.$.dateread":datenow}},
			{safe: true, upsert: true, new: true},
			function (err, user) {
				if (err) throw err;

			});
	var userQuery = User.findOne({email: user_send}).exec(); //tim email voi tham so truyen vao la email
	userQuery.addBack(function (err, user) {
			User.update(
				{_id: user._id, "message_send._id": mess_id_send},
				{$set: {"message_send.$.read": true, "message_send.$.dateread": datenow}},
				{safe: true, upsert: true, new: true},
				function (err, user) {
					if (err) throw err;
					res.render('index',{user: req.user});
				})
		})
});
router.post('/new_messages',function(req,res,next){
	var email = req.body.email;
	var textmess = req.body.textmess;
	var idnhan = "123";
	var idgui = "123";
	req.checkBody('email', 'Yêu cầu nhập email').notEmpty();
	req.checkBody('email', 'Email không tồn tại').isEmail();
	req.checkBody('textmess', 'Yêu cầu nhập nội dung').notEmpty();
	var datenow = new Date();
	var errors = req.validationErrors();
	if(errors){
		res.render('new_messages', { errors:errors});
	}else{
		if (email == req.user.email)
		{
			req.checkBody('email', 'Không thể gửi tin nhắn tới chính mình').equals('a');
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
					if ( dem != 0) {
						var user_nhan = user;
						//Lưu tin nhắn gữi vào dbs
						var dem2 = 0;
						for (var i = 0; i < user_nhan.blocklist.length; i++) // truy xuat bang friend trong database
						{
							if (user_nhan.blocklist[i].email == req.user.email) {
								dem2++;
								break;
							}
						}
						if ( dem2 != 0)
						{
							req.checkBody('email', 'Bạn đã bị block bởi '+ email+',không thể gửi tin nhắn').equals('a');
							errors = req.validationErrors();
							res.render('new_messages', { errors:errors});
						}
						else {
							User.findByIdAndUpdate(
								user_nhan._id,
								{
									$push: {
										"message_rec": {
											user_send: req.user.email,
											message: textmess, datesent: datenow
										}
									}
								},
								{safe: true, upsert: true, new: true},
								function (err, user) {
									if (err) throw err;
									idnhan = user.message_rec[user.message_rec.length - 1]._id;
									User.findByIdAndUpdate(
										req.user._id,
										{
											$push: {
												"message_send": {
													user_send: email,
													message: textmess,
													datesend: datenow,
													mess_id_nhan: idnhan
												}
											}
										},
										{safe: true, upsert: true, new: true},
										function (err, user) {
											if (err) throw err;
											idgui = user.message_send[user.message_send.length - 1]._id;
											User.update(
												{_id: user_nhan._id, "message_rec._id": idnhan},
												{$set: {"message_rec.$.mess_id_send": idgui}},
												{safe: true, upsert: true, new: true},
												function (err, user) {
													if (err) throw err;
												});
											res.redirect('new_messages');
										});

								});
						}
					}
					else{
						req.checkBody('email', 'Email này không có trong danh sách bạn bè').equals('a');
						errors = req.validationErrors();
						res.render('new_messages', {errors: errors});
					}
				}
				else {
					req.checkBody('email', 'Email không tồn tại').equals('a');
					errors = req.validationErrors();
					res.render('new_messages', {errors: errors});
				}

			});
		}
	}
});

router.post('/friend',function(req,res,next){

	var email = req.body.email;
	var inputValue = req.body.submit;
	req.checkBody('email', 'email field is require').notEmpty();
	req.checkBody('email', 'email not valid').isEmail();;
	var errors = req.validationErrors();
	if(errors){
		res.render('friend', { errors:errors});
	}else{
		if (email == req.user.email)
		{
			if ( inputValue == 'Add')
				req.checkBody('email', 'Không thể kết bạn chính mình').equals('a');
			if ( inputValue == 'Block')
				req.checkBody('email', 'Không thể block chính mình').equals('a');
			if ( inputValue == 'Unblock')
				req.checkBody('email', 'Không thể unblock chính mình').equals('a');
			errors = req.validationErrors();
			res.render('friend', { errors:errors});
		}
		else {
			var userQuery = User.findOne({email: email}).exec(); //tim email voi tham so truyen vao la email
			userQuery.addBack(function (err, user) {
				if (!!user) {
					if ( inputValue == 'Add') {
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
									if (err) throw err;
								});
							User.update({_id:req.user._id},
								{$pull:{blocklist : {email: email}}},function (err, user) {
									if (err) throw err;

								});
							req.flash('success_msg', 'Thêm thành công : '+ email);
							res.redirect('friend');
						} else {
							req.checkBody('email', 'Email này đã có trong danh sách bạn bè').equals('a');
							errors = req.validationErrors();
							res.render('friend', {errors: errors});
						}
					}
					else if ( inputValue == 'Delete') {
						var dem = 0;
						for (var i = 0; i < req.user.friendship.length; i++) // truy xuat bang friend trong database
						{
							if (req.user.friendship[i].email == email) {
								dem++;
								break;
							}
						}
						if (dem == 0) {
							req.checkBody('email', 'Email này không có trong danh sách bạn bè').equals('a');
							errors = req.validationErrors();
							res.render('friend', {errors: errors})
						}
						else {
							User.update({_id:req.user._id},
								{$pull:{friendship : {email: email}}},function (err, user) {
									if (err) throw err;
	
								});
							req.flash('success_msg', 'Đã xóa thành công : '+ email);
							res.redirect('friend');
						}
					}
					
					else if ( inputValue == 'Block') {
						var dem = 0;
						for (var i = 0; i < req.user.blocklist.length; i++) // truy xuat bang friend trong database
						{
							if (req.user.blocklist[i].email == email) {
								dem++;
								break;
							}
						}
						if (dem == 0) {
							//them email vao trong danh sach ban be
							User.findByIdAndUpdate(
								req.user._id,
								{$push: {"blocklist": {email: email}}},
								{safe: true, upsert: true, new: true},
								function (err, user) {
									if (err) throw err;
								});
							User.update({_id:req.user._id},
								{$pull:{friendship : {email: email}}},function (err, user) {
									if (err) throw err;
							
								});
							
							req.flash('success_msg', 'Đã block thành công : '+ email);
							res.redirect('friend');
						} else {
							req.checkBody('email', 'Email này đã có trong Blocklist').equals('a');
							errors = req.validationErrors();
							res.render('friend', {errors: errors});
						}
					}
					else if ( inputValue == 'Unblock')
					{
						var dem = 0;
						for (var i = 0; i < req.user.blocklist.length; i++) // truy xuat bang friend trong database
						{
							if (req.user.blocklist[i].email == email) {
								dem++;
								break;
							}
						}
						if (dem == 0) {
							//them email vao trong danh sach ban be
							req.checkBody('email', 'Email này không có trong Blocklist').equals('a');
							errors = req.validationErrors();
							res.render('friend', {errors: errors});
						} else {
							
							User.update({_id:req.user._id},
								{$pull:{blocklist : {email: email}}},
								function (err, user) {
									if (err) throw err;

								});
							req.flash('success_msg', 'Unblock thành công : '+ email);
							res.redirect('friend');
						}
						
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