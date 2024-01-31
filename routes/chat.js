const {Router}= require('express');
const chatRoute=Router();
const Chat= require("../schema/message");
const User= require("../schema/user");

// function to extract details of owner's pic
async function fetchData(email){
  try{
    const user = await User.findOne({email: email});
    return {pic: user.pic,username: user.username};
  }
  catch(err){
    console.log(err);
  }
}

// Chat page for owner
chatRoute.get("/chat", async function (req, res) {
  if (req.isAuthenticated()) {
    const foundChats = await Chat.find({ owner_email: req.user.email }).exec();
    
    const chatData = await Promise.all(foundChats.map(async function (single_item_chat) {
      const Data = await Promise.all(single_item_chat.chats.map(async function (individual) {
        const buyerData = await fetchData(individual.buyer_email);
        return buyerData;
      }));
      return Data;
    }));
  
    res.render("chat_page", { user: req.user, chats: foundChats, chatData: chatData });
  } else {
    res.redirect('/');
  }
});


chatRoute.post("/chatWithOwner", function (req, res) {
    const body = req.body;
    Chat.findOne(
      { item_name: body.item_name, owner_email: body.owner_email },
      async function (err, found) {
        if (err) console.log(err);
        else {
          console.log(found);
          if (found) {
            let isAvail = false;
            const ownerData = await fetchData(body.owner_email);
            found.chats.forEach(function (chat, index) {
              if (chat.buyer_email === req.user.email) {
                isAvail = true;
                res.render("chat_room", {
                  user: req.user,
                  chat: chat,
                  item: body,
                  receiver: ownerData,
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
                receiver: ownerData,
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
        async function (err, found) {
        if (err) console.log(err);
        else {
            if (found) {
            let isAvail = false;
            const buyerData = await fetchData(body.buyer_email);
            found.chats.forEach(function (chat, index) {
                if (chat.buyer_email === body.buyer_email) {
                isAvail = true;
                res.render("chat_room", {
                    user: req.user,
                    chat: chat,
                    item: body,
                    receiver: buyerData,
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
                receiver: buyerData,
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
              res.redirect(`/chatWithOwner/${found._id}`);
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
              res.redirect(`/chatWithBuyer/${found._id}-${chat._id}`);
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

chatRoute.get("/chatWithOwner/:id", (req,res)=>{
  if (req.isAuthenticated()) {
    chat_id = req.params.id;
    Chat.findOne(
      { _id: chat_id },
      (err,found)=>{
        if (err) {
          console.log(err);
        }
        else{
          if (found){
            found.chats.forEach(async (chat,index)=>{
              if (chat.buyer_email === req.user.email){
                const ownerData = await fetchData(found.owner_email);
                res.render("chat_room",{
                  user: req.user,
                  chat: chat,
                  item: {item_name: found.item_name, owner_email: found.owner_email, buyer_email:chat.buyer_email},
                  receiver: ownerData,
                });
              }
            })
          }
        }
      });
    } else {
      res.redirect("/");
    }
});

chatRoute.get("/chatWithBuyer/:id", (req,res)=>{
  if (req.isAuthenticated()) {
    idArray = req.params.id.split('-');
    itemChat_id = idArray[0];
    chat_id = idArray[1];
    Chat.findOne(
      { _id: itemChat_id },
      (err,found)=>{
        if (err) {
          console.log(err);
        }
        else{
          if (found){
            found.chats.forEach(async (chat,index)=>{       
              if (found.owner_email === req.user.email && chat._id.toString() === chat_id){
                const buyerData = await fetchData(chat.buyer_email);
                res.render("chat_room",{
                  user: req.user,
                  chat: chat,
                  item: {item_name: found.item_name, owner_email: found.owner_email, buyer_email:chat.buyer_email},
                  receiver: buyerData,
                });
              }
            })
          }
        }
      });
    } else {
      res.redirect("/");
    }
});
module.exports =  chatRoute;
