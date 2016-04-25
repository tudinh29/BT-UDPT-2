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
function ensureAuthenticated(req,res,next){
  if (infoUser){
    return next();
  } else{
      res.redirect('/users/login');
  }
}
module.exports = router;
