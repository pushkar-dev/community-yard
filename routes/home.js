const {Router}= require('express');
const homeRoute=Router();
const Chat = require("../schema/message");
const Item = require("../schema/item");

homeRoute.get("/", function (req, res) {
    if (req.isAuthenticated()) {
      // res.render("home", { user: req.user, msgs: [] });
      Chat.find({owner_email: req.user.email },
        function(err, found) {
            console.log(found);
            if (err) console.log(err);
            else {
              res.render("home", { user: req.user,chats:found });
            }
          });
    } else {
      res.render("home", { user: null, chats:[] });
    }
});

// Scrapyard
homeRoute.get("/scrapyard", function (req, res) {
    if (req.isAuthenticated()) {
      const user = req.user;
      Item.find({}, function (err, found) {
        if (err) console.log(err);
        else {
          res.render("home", { user: user, ads: found });
        }
      });
    } else {
      res.render("home", { user: null });
    }
});

homeRoute.get("/logout", function (req, res) {
    req.logout();
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