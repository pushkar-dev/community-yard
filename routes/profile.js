const { Router } = require('express');
const profileRoute = Router();

profileRoute.get('/profile/:uname', (req, res) => {
  username = req.params.uname;
  res.render('profile',{user: req.user});
});

module.exports = profileRoute;
