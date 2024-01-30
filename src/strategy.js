require("dotenv").config();
const User = require("../schema/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const strategy = new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      // callbackURL: "https://community-scrapeyard.herokuapp.com/auth/google/CS",
      callbackURL: "http://marketplace.iitmandi.co.in/auth/google/CS",
      userProfileUrl: "https://www.googleapis.com.oauth2.v3.userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { username: profile.id },
        {
          name: profile._json.name,
          pic: profile._json.picture,
          email: profile._json.email,
        },
        function (err, user) {
          console.log(profile.displayName);
          return cb(err, user);
        }
      );
    }
  );

  module.exports = strategy;
