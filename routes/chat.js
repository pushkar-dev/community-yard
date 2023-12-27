const {Router}= require('express');
const chatRoute=Router();
const Chat= require("../schema/message");

chatRoute.post("/chatWithOwner", function (req, res) {
    const body = req.body;
    Chat.findOne(
      { item_name: body.item_name, owner_email: body.owner_email },
      function (err, found) {
        if (err) console.log(err);
        else {
          console.log(found);
          if (found) {
            let isAvail = false;
            found.chats.forEach(function (chat, index) {
              if (chat.buyer_email === req.user.email) {
                isAvail = true;
                res.render("chat_room", {
                  user: req.user,
                  chat: chat,
                  item: body,
                });
              }
            });
            if (!isAvail) {
              const chatObj = {
                buyer_email: req.user.email,
                msg: [],
              };
              found.chats.push(chatObj);
              found.save();
              res.render("chat_room", {
                user: req.user,
                chat: chatObj,
                item: body,
              });
            }
          }
        }
      }
    );
});

  // Chat with buyer route
chatRoute.post("/chatWithBuyer", function (req, res) {
        const body = req.body;
        Chat.findOne(
        { item_name: body.item_name, owner_email: req.user.email },
        function (err, found) {
        if (err) console.log(err);
        else {
            if (found) {
            let isAvail = false;
            found.chats.forEach(function (chat, index) {
                if (chat.buyer_email === body.buyer_email) {
                isAvail = true;
                res.render("chat_room", {
                    user: req.user,
                    chat: chat,
                    item: body,
                });
                }
            });
            if (!isAvail) {
                const chatObj = {
                buyer_email: body.buyer_email,
                msg: [],
                };
                found.chats.push(chatObj);
                found.save();
                res.render("chat_room", {
                user: req.user,
                chat: chatObj,
                item: body,
                });
            }
            }
        }
        }
    );
});

// When buyer sends a message to owner
chatRoute.post("/buyerSendMsg", function (req, res) {
  console.log(req.body);
  if (req.isAuthenticated()) {
    const body = req.body;
    Chat.findOne(
      { item_name: body.item_name, owner_email: body.owner_email },
      function (err, found) {
        if (err) console.log(err);
        else {
          let isAvail = false;
          found.chats.forEach(function (chat, i) {
            if (chat.buyer_email === req.user.email) {
              isAvail = true;
              const obj = {
                conv: body.msg,
                msg_sender: req.user.email,
              };
              chat.msg.push(obj);
              found.save();
              res.render("chat_room", {
                user: req.user,
                chat: chat,
                item: body,
              });
            }
          });
          if (!isAvail) {
            // This block will never be executed because if the sender is sending a message /
            // then the chat object will obviously be created.
            const chatObj = {
              buyer_email: body.buyer_email,
              msg: [],
            };
            found.chats.push(chatObj);
            found.save();
            res.render("chat_room", {
              user: req.user,
              chat: chatObj,
              item: body,
            });
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});
// When owner sends a message to buyer
chatRoute.post("/ownerSendMsg", function (req, res) {
  // console.log(req.body);
  if (req.isAuthenticated()) {
    const body = req.body;
    Chat.findOne(
      { item_name: body.item_name, owner_email: req.user.email },
      function (err, found) {
        if (err) console.log(err);
        else {
          console.log(found);
          let isAvail = false;
          found.chats.forEach(function (chat, i) {
            if (chat.buyer_email === body.buyer_email) {
              isAvail = true;
              const obj = {
                conv: body.msg,
                msg_sender: req.user.email,
              };
              chat.msg.push(obj);
              found.save();
              res.render("chat_room", {
                user: req.user,
                chat: chat,
                item: body,
              });
            }
          });
          if (!isAvail) {
            // This block will never be executed because if the sender is sending a message /
            // then the chat object will obviously be created.
            const chatObj = {
              buyer_email: body.buyer_email,
              msg: [],
            };
            found.chats.push(chatObj);
            found.save();
            res.render("chat_room", {
              user: req.user,
              chat: chatObj,
              item: body,
            });
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

module.exports =  chatRoute;