const {Router}= require('express');
const Item = require('../schema/item');
const Chat= require('../schema/message');
var upload = require("../src/storage");
const addRoute = Router();

addRoute.get("/newAdd", function (req, res) {
    if (req.isAuthenticated()) {
      res.render("addform", { user: req.user });
    } else {
      res.redirect("/");
    }
});

addRoute.post("/addItem", upload.single("image"), function (req, res) {
  if (req.isAuthenticated()) {
    const item = req.body;
    console.log(item);
    Item.findOne(
      { item_name: item.item_name, owner_email: item.owner_email },
      function (err, foundList) {
        if (!err) {
          const newItem = new Item({
            item_name: item.item_name,
            person_name: item.person_name,
            owner_email: item.owner_email,
            item_description: item.item_description,
            item_price: item.item_price,
            person_contact: item.person_contact,
            upload: req.file.filename != undefined ? req.file.filename : "",
            uploadType: req.file.mimetype != undefined ? req.file.mimetype : "",
          });
          newItem.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
          const newChat = new Chat({
            item_name: item.item_name,
            owner_email: item.owner_email,
            chats: [],
          });
          newChat.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
          res.redirect("/");
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

addRoute.post("/deleteAd", function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.email === req.body.owner_email) {
      const body = req.body;
      Chat.deleteOne(
        { item_name: body.item_name, owner_email: body.owner_email },
        function (err, res) {
          if (err) console.log(err);
          else {
            console.log("Chat deleted");
          }
        }
      );
      Item.deleteOne(
        { item_name: body.item_name, owner_email: body.owner_email },
        function (err, res) {
          if (err) console.log(err);
          else {
            console.log("Item Deleted successfully");
          }
        }
      );
      res.redirect("/fetchForOwner");
    } 
    else {
      res.redirect("/fetchForBuyer");
    }
  }
});

module.exports = addRoute;