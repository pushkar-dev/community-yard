const {Router}= require('express');
const passport = require("passport");

const authRoute= Router();
authRoute.get(
    "/",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
);
  
authRoute.get(
    "/CS",
    passport.authenticate("google", { failureRedirect: "/" }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");
    }
);


module.exports = authRoute;