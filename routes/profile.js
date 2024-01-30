const { Router } = require('express');
const profileRoute = Router();
const User = require('../schema/user');
const Item = require('../schema/item');

profileRoute.get('/profile/:username', (req, res) => {
  if (req.isAuthenticated()) {
    username = req.params.username;
    User.findOne({ username: username }, (err,found)=>{
      if (err) {
        console.log(err);
        res.redirect('/');
      }
      else {
        Item.find({ owner_email: found.email }, (err,items)=>{
          if (err) {
            console.log(err);
            res.redirect('/');
          }
          else {
            console.log(items);
            res.render('profile', {profile_user: found, items: items, user: req.user});
          }
        });
      }
    });
} else {
    res.redirect('/');
}
});

module.exports = profileRoute;
