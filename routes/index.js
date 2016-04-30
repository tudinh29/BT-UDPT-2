var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',ensureAuthenticated, function(req, res, next) {
	res.render('index', { title: 'Message' ,user:req.user});
	res.redirect('/users/index')
});

router.get('/users/index',ensureAuthenticated, function(req, res, next) {
	res.render('index',{
		'title': 'Messages', user : req.user
	})
});

router.get('/users/new_messages',ensureAuthenticated, function(req, res, next) {
	res.render('new_messages',{
		'title': 'New messages' , user : req.user
	})
});


router.get('/users/sent_messages',ensureAuthenticated, function(req, res, next) {
	res.render('sent_messages',{
		'title': 'Sent messages' , user : req.user
	})
});

router.get('/users/friend',ensureAuthenticated, function(req, res, next) {
	res.render('friend',{
		'title': 'Friend' , user : req.user
	})
});
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;