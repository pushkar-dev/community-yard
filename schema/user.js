const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    name: String,
    pic: String,
    email: String,
  });

userSchema.plugin(passportLocalMongoose, {
usernameField: "username",
});
userSchema.plugin(findOrCreate);

const User = mongoose.model("user", userSchema);
module.exports = User;