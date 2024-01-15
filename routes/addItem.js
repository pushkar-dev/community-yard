const { Router } = require("express");
const Item = require("../schema/item");
const Chat = require("../schema/message");
var upload = require("../src/storage");
const addRoute = Router();
const fs = require("fs");
const path = require("path");

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

      // Find the item in the database
      Item.findOne(
        {
          item_name: body.item_name,
          owner_email: body.owner_email,
        },
        function (err, item) {
          if (err) console.log(err);
          else {
            // Delete the image file
            const filePath = path.join(
              __dirname,
              "..",
              "uploaded_docs",
              item.upload
            );
            console.log("Deleting file:", filePath);
            fs.unlink(filePath, function (err) {
              if (err) {
                console.log("Error deleting file:", err);
              } else {
                console.log("Image file deleted");
              }
            });
            // Delete the chat
            Chat.deleteOne(
              {
                item_name: body.item_name,
                owner_email: body.owner_email,
              },
              function (err, res) {
                if (err) console.log(err);
                else console.log("Chat deleted");
              }
            );

            // Delete the item
            Item.deleteOne(
              {
                item_name: body.item_name,
                owner_email: body.owner_email,
              },
              function (err, res) {
                if (err) console.log(err);
                else console.log("Item deleted");
              }
            );
            res.redirect("/");
          }
        }
      );
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});

module.exports = addRoute;
