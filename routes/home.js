const {Router}= require('express');
const homeRoute=Router();
const Chat = require("../schema/message");
const Item = require("../schema/item");

homeRoute.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    Item.find({}, function (err, found) {
    if (err) {
        console.log(err);
        res.redirect("/");
    } else {
        res.render("itemsAvailable", { user: req.user, items: found });
    }
    });
    } else {
      res.render('home', {user: null});
    }
});

homeRoute.get("/logout", function (req, res) {
    req.logout((err) => {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/");
});
  
homeRoute.get("/dev", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("comingSoon", { user: req.user });
    } else {
        res.render("comingSoon", { user: null });
    }
});

module.exports = homeRoute;