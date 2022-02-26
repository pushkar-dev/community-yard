require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const express = require("express");
const ejsMate = require("ejs-mate");
const ejs = require("ejs");
const mongoose = require("mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
require("https").globalAgent.options.rejectUnauthorized = false;
// const mongoStore = require("connect-mongo");

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    // store: mongoStore.create({
    //   mongoUrl: process.env.PASS
    // })
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/CS"); //, {useNewUrlParser: true,useUnifiedTopology: true,}); //Running on localhost
// mongoose.connect(String(process.env.PASS),{ useNewUrlParser: true , useUnifiedTopology: true}); // Running on a remote server

/////////       Schema Creation       //////////
const itemSchema = new mongoose.Schema({
  // db1
  itemName: String,
  person_email: String,
  item_image_url: String,
  item_description: String,
  item_price: String,
  person_contact: String,
});

const chatSchema = new mongoose.Schema({
  item_name: String,
  item_owner: String,
  chats: [
    {
      sender: String,
      msg: [
        {
          time: Date,
          conv: String,
        },
      ],
    },
  ],
});
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
const Chat = mongoose.model("chat", chatSchema);
const Item = mongoose.model("item", itemSchema);

passport.use(User.createStrategy());

////////  Creating sessions and serializing   //////////
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

////////Google OAuth 2.0 Strategy/////////
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      // callbackURL: "https://community-scrapeyard.herokuapp.com/auth/google/CS",
      callbackURL: "http://localhost:8080/auth/google/CS",
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
  )
);

// ///////////////////////////////////////////////
// /////////// Get Routes ////////////////////////
// ///////////////////////////////////////////////

//////        Google Authentication       /////////
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/CS",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

// Home route
app.get("/", function (req, res) {
  if(req.isAuthenticated()){
    res.render('home', {user:req.user});
  }
  else{
    res.render('home', {user:null});
  }
});

// Scrapeyard 
app.get("/scrapeyard", function (req, res) {
  if (req.isAuthenticated()) {
    const user = req.user;
    Item.find({}, function (err, found) {
      if (err) console.log(err);
      else {
        res.render("home", { user: user, ads: found });
      }
    });
  } else {
    res.render("home", { user: null });
  }
});

// about page
// Logging out
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/newAdd", function (req, res) {
  if (req.isAuthenticated()) {
    const item = req.body;
    Item.findOne(
      { itemName: item.itemName, person_email: item.person_email },
      function (err, foundList) {
        if (!err) {
          const newItem = new Item({
            itemName: item.itemName,
            person_email: item.person_email,
            item_image_url: item.item_image_url,
            item_description: item.item_description,
            item_price: item.item_price,
            person_contact: item.person_contact,
          });
          newItem.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
          const newChat = new Chat({
            itemName: item.itemName,
            item_owner: item.person_email,
            chats: [],
          });
          newChat.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/fetchForOwner", function (req, res) {
});

app.get("/fetchForBuyer", function (req, res) {
});

app.get("/newAdd", function (req, res) {
  res.render('addFrom');
});

app.listen(process.env.PORT || 8080, function () {
  console.log("Server running on port 8080");
});
