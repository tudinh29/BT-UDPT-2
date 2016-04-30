var express = require('express');
var router = express.Router();
infoUser = null;
/* GET home page. */
router.get('/',ensureAuthenticated, function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/users/index',ensureAuthenticated, function(req, res, next) {
    res.render('index',{
        'title': 'Messages'
    })
});

router.get('/users/new_messages',ensureAuthenticated, function(req, res, next) {
    res.render('new_messages',{
        'title': 'New messages'
    })
});


router.get('/users/sent_messages',ensureAuthenticated, function(req, res, next) {
    res.render('sent_messages',{
        'title': 'Sent messages'
    })
});

router.get('/users/friend',ensureAuthenticated, function(req, res, next) {
    res.render('friend',{
        'title': 'Friend'
    })
});


function ensureAuthenticated(req,res,next){
  if (infoUser){
    return next();
  } else{
      res.redirect('/users/login');
  }
}
module.exports = router;
