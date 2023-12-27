const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
    buyer_email: String,
    msg: [
      {
        conv: String,
        msg_sender: String,
      },
    ],
  });
// const msg = mongoose.model("msg", msgSchema);
const chatSchema = new mongoose.Schema({
    item_name: String,
    owner_email: String,
    chats: [msgSchema],
 });

const Chat = mongoose.model("chat", chatSchema);

module.exports = Chat;

  