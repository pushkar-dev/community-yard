const { Router } = require('express');
const profileRoute = Router();

profileRoute.get('/profile/:username', (req, res) => {
  username = req.params.username;
  res.render('profile',{user: req.user});
});

module.exports = profileRoute;
