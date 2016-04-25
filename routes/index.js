var express = require('express');
var router = express.Router();
infoUser = null;
/* GET home page. */
router.get('/',ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Members' });
});
function ensureAuthenticated(req,res,next){
  if (infoUser){
    return next();
  } else{
      req.flash('error_message','not succes');
      res.redirect('/users/login');
  }
}
module.exports = router;
