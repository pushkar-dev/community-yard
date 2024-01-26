const { Router } = require('express');
const profileRoute = Router();
const User = require('../schema/user');

profileRoute.get('/profile/:username', (req, res) => {
  if (req.isAuthenticated()) {
  username = req.params.username;
  User.findOne({ username: username }, (err,found)=>{
    if (err) {
      console.log(err);
      res.redirect('/');
    }
    else{
      res.render('profile', {user: found});
    }
  });
} else {
  res.redirect('/');
}
});

module.exports = profileRoute;
