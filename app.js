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
// var http = require("http").Server(app);
// var io = require("socket.io")(http);
require("https").globalAgent.options.rejectUnauthorized = false;
const multer = require("multer");
// const mongoStore = require("connect-mongo");

const app = express();
app.use(express.static("public"));
app.use(express.static("uploaded_docs"))
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

// Configure file storage mechanism from multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploaded_docs/')
    },
    filename: function (req, file, cb) {
        cb(null, req.body.person_email + '__' + String(Date.now()) + 
        '.' + file.mimetype.split('/')[1]);
    }
  })
  var upload = multer({ storage: storage });
mongoose.connect("mongodb://localhost:27017/CS"); //, {useNewUrlParser: true,useUnifiedTopology: true,}); //Running on localhost
// mongoose.connect(String(process.env.PASS),{ useNewUrlParser: true , useUnifiedTopology: true}); // Running on a remote server

///////////////////////////////////
// const website_list = ['gymkhana.iitmandi.co.in', 'iitmandi.co.in', 'ecell.iitmandi.co.in', 'hnt.iitmandi.co.in', 'litsoc.iitmandi.co.in', 'mtb.iitmandi.co.in', 'pc.iitmandi.co.in', 'robotronics.iitmandi.co.in', 'saic.iitmandi.co.in', 'stac.iitmandi.co.in', 'yantrik.iitmandi.co.in', 'astrores.iitmandi.co.in', 'baat-cheet.iitmandi.co.in', 'discourse.iitmandi.co.in', 'codemaniacs.iitmandi.co.in', 'tartarusctf.iitmandi.co.in', 'yggdrasil.iitmandi.co.in', 'frosthack.in', 'quiz.iitmandi.co.in', 'rover.iitmandi.co.in', 'srijan.iitmandi.co.in', 'uri.iitmandi.co.in', 'sntc.iitmandi.ac.in', 'sports.iitmandi.co.in', 'wiki.iitmandi.co.in']
////////////

/////////       Schema Creation       //////////
const itemSchema = new mongoose.Schema({
  // db1
  itemName: String,
  person_name: String,
  person_email: String,
  item_description: String,
  item_price: String,
  person_contact: String,
  upload : {type : String, default : ""},
  uploadType : {type : String, default : ""}
});

const chatSchema = new mongoose.Schema({
  item_name: String,
  item_owner: String,
  chats: [
    {
      buyer_name: String,
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
const websiteSchema = new mongoose.Schema({
  website_url: String,
  report_type: String,
  error_description: String,
  email: String,
  date: Date,
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "username",
});
userSchema.plugin(findOrCreate);

const User = mongoose.model("user", userSchema);
const Chat = mongoose.model("chat", chatSchema);
const Item = mongoose.model("item", itemSchema);
const Website = mongoose.model("website", websiteSchema);

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

////////////////////////////////////////////////////////
////////////////// POST REQUESTS ///////////////////////
////////////////////////////////////////////////////////

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
  if (req.isAuthenticated()) {
    res.render("home", { user: req.user });
  } else {
    res.render("home", { user: null });
  }
});

// Scrapyard
app.get("/scrapyard", function (req, res) {
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

app.get("/fetchForOwner", function (req, res) {
  //manage
  if (req.isAuthenticated()) {
    const user = req.user;
    Item.find({ person_email: user.email }, function (err, found) {
      if (err) console.log(err);
      else {
        res.render("manageItems", { user: user, items: found });
      }
    });
  } else {
    res.redirect("/");
  }
});

app.get("/fetchForBuyer", function (req, res) {
  // items available
  Item.find({}, function (err, found) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      if (req.isAuthenticated()) {
        res.render("itemsAvailable", { user: req.user, items: found });
      } else {
        res.render("itemsAvailable", { user: null, items: found });
      }
    }
  });
});

app.get("/newAdd", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("addform", { user: req.user });
  } else {
    res.redirect("/");
  }
});
// Logout
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/dev", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("comingSoon", { user: req.user });
  } else {
    res.render("comingSoon", { user: null });
  }
});
app.get("/websiteStatus", function (req, res) {
  Website.find({}, function (err, websites) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      if (req.isAuthenticated()) {
        res.render("websiteStatus", { user: req.user, websites: websites });
      } else {
        res.render("websiteStatus", { user: null, websites: websites });
      }
    }
  });
});
app.get("/chat", function (req, res) {
  const body = req.body;
  Chat.findOne(
    { item_name: body.item_name, item_owner: body.item_owner },
    function (err, found) {
      if (err) console.log(err);
      else {
        if (found) {
          const isAvail = false;
          found.chats.forEach(function (chat, index) {
            if (chat.buyer_name === req.user.name) {
              isAvail = true;
              res.render("chat_room", { user: req.user, chat: chat });
            }
          });
          if (!isAvail) {
            const chatObj = {
              buyer_name: req.user.name,
              msg: [],
            };
            found.chats.push(chatObj);
            res.render("chat_room", { user: req.user, chat: chatObj });
          }
        }
      }
    }
  );
});

// Code for creating a socket connection
// io.on("connection", () => {
//   console.log("a user is connected");
// });
////////////////////////////////////////////////////////
////////////////// POST REQUESTS ///////////////////////
////////////////////////////////////////////////////////
app.post("/addItem", upload.single('image'),function (req, res) {
  if (req.isAuthenticated()) {
    const item = req.body;
    console.log(item);
    Item.findOne(
      { itemName: item.itemName, person_email: item.person_email },
      function (err, foundList) {
        if (!err) {
          const newItem = new Item({
            itemName: item.itemName,
            person_name: item.person_name,
            person_email: item.person_email,
            item_description: item.item_description,
            item_price: item.item_price,
            person_contact: item.person_contact,
            upload : (req.file.filename != undefined)? req.file.filename : '',
            uploadType :(req.file.mimetype != undefined)? req.file.mimetype : '',
          });
          newItem.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
        //   const chatSchema = new mongoose.Schema({
        //     item_name: String,
        //     item_owner: String,
        //     chats: [
        //       {
        //         buyer_name: String,
        //         msg: [
        //           {
        //             time: Date,
        //             conv: String,
        //           },
        //         ],
        //       },
        //     ],
        //   });
          const newChat = new Chat({
            item_name: item.itemName,
            item_owner: item.person_email,
            chats: [],
          });
          newChat.save(function (err) {
            if (err) {
              console.log(err);
            }
          });
          res.redirect('/');
        }
      }
    );
  } else {
    res.redirect("/");
  }
});
app.post("/websiteReport", function (req, res) {
  if (req.isAuthenticated()) {
    const report = req.body;
    const url = report.website_url.toLowerCase();
    // if (website_list.includes(report.website_url.toLowerCase())) {
    if (url.includes("iitmandi.ac.in") || url.includes("iitmandi.co.in")) {
      const newReport = new Website({
        website_url: report.website_url.toLowerCase(),
        error_description: report.Desc,
        report_type: report.report_type,
        email: report.email,
        date: Date(),
      });
      newReport.save(function (err) {
        if (err) {
          console.log(err);
        }
      });
    } else {
      console.log("Not present on SNTC server");
    }

    res.redirect("/websiteStatus");
  } else {
    res.redirect("/");
  }
});
app.post("/deleteStatus", function (req, res) {
  if (req.isAuthenticated()) {
    Website.deleteOne({ _id: req.body.id })
      .then(function () {
        console.log("Data deleted"); // Success
      })
      .catch(function (error) {
        console.log(error); // Failure
      });
    res.redirect("/websiteStatus");
  } else {
    res.redirect("/");
  }
});

app.listen(process.env.PORT || 8080, function () {
  console.log("Server running on port 8080");
});
