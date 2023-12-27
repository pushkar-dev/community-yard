const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    // db1
    item_name: String,
    person_name: String,
    owner_email: String,
    item_description: String,
    item_price: String,
    person_contact: String,
    upload: { type: String, default: "" },
    uploadType: { type: String, default: "" },
  });

const Item = mongoose.model("item", itemSchema);
module.exports = Item;