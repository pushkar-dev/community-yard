const {Router} = require('express');
const fetchRoute = Router();
const Item = require("../schema/item");

fetchRoute.get("/fetchForOwner", function (req, res) {
    //manage
    if (req.isAuthenticated()) {
      const user = req.user;
      Item.find({ owner_email: user.email }, function (err, found) {
        if (err) console.log(err);
        else {
          res.render("manageItems", { user: user, items: found });
        }
      });
    } else {
      res.redirect("/");
    }
});

module.exports = fetchRoute;