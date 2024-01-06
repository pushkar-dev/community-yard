const { Router } = require('express');
const profileRoute = Router();

profileRoute.get('/profile/:uname', (req, res) => {
  username = req.params.uname;
  res.send(`Welcome to ${username}'s profile page`);
});

module.exports = profileRoute;
