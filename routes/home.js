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
              res.render("chat_page", { user: req.user,chats:found });
            }
          });
    } else {
      res.render("chat_page", { user: null, chats:[] });
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