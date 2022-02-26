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

///////////////////////////////////
const website_list = ['gymkhana.iitmandi.co.in', 'iitmandi.co.in', 'ecell.iitmandi.co.in', 'hnt.iitmandi.co.in', 'litsoc.iitmandi.co.in', 'mtb.iitmandi.co.in', 'pc.iitmandi.co.in', 'robotronics.iitmandi.co.in', 'saic.iitmandi.co.in', 'stac.iitmandi.co.in', 'yantrik.iitmandi.co.in', 'astrores.iitmandi.co.in', 'baat-cheet.iitmandi.co.in', 'discourse.iitmandi.co.in', 'codemaniacs.iitmandi.co.in', 'tartarusctf.iitmandi.co.in', 'yggdrasil.iitmandi.co.in', 'frosthack.in', 'quiz.iitmandi.co.in', 'rover.iitmandi.co.in', 'srijan.iitmandi.co.in', 'uri.iitmandi.co.in', 'sntc.iitmandi.ac.in', 'sports.iitmandi.co.in', 'wiki.iitmandi.co.in']
    ////////////


/////////       Schema Creation       //////////
const itemSchema = new mongoose.Schema({
    // db1
    itemName: String,
    person_name: String,
    person_email: String,
    item_image_url: String,
    item_description: String,
    item_price: String,
    person_contact: String,
});

const chatSchema = new mongoose.Schema({
    item_name: String,
    item_owner: String,
    chats: [{
        buyer: String,
        msg: [{
            time: Date,
            conv: String,
        }, ],
    }, ],
});

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    name: String,
    pic: String,
    email: String,
});
const websiteSchema = new mongoose.Schema({
    website_url: String,
    error_description: String,
    email: String,
    date: Date
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
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

////////Google OAuth 2.0 Strategy/////////
passport.use(
    new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            // callbackURL: "https://community-scrapeyard.herokuapp.com/auth/google/CS",
            callbackURL: "http://localhost:8080/auth/google/CS",
            userProfileUrl: "https://www.googleapis.com.oauth2.v3.userinfo",
        },
        function(accessToken, refreshToken, profile, cb) {
            User.findOrCreate({ username: profile.id }, {
                    name: profile._json.name,
                    pic: profile._json.picture,
                    email: profile._json.email,
                },
                function(err, user) {
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
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");
    }
);

// Home route
app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("home", { user: req.user });
    } else {
        res.render("home", { user: null });
    }
});

// Scrapeyard
app.get("/scrapeyard", function(req, res) {
    if (req.isAuthenticated()) {
        const user = req.user;
        Item.find({}, function(err, found) {
            if (err) console.log(err);
            else {
                res.render("home", { user: user, ads: found });
            }
        });
    } else {
        res.render("home", { user: null });
    }
});

app.get("/fetchForOwner", function(req, res) {
    //manage
    if (req.isAuthenticated()) {
        const user = req.user;
        Item.find({ person_email: user.email }, function(err, found) {
            if (err) console.log(err);
            else {
                res.render("/manageItems", { user: user, items: found });
            }
        });
    } else {
        res.redirect("/");
    }
});

app.get("/fetchForBuyer", function(req, res) {
    // items available
    if (req.isAuthenticated()) {
        Item.find({}, function(err, found) {
            if (err) console.log(err);
            else {
                res.render("itemsAvailable", { user: req.user, items: found });
            }
        });
    } else {
        res.redirect("/");
    }
});

app.get("/newAdd", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("addform", { user: req.user });
    } else {
        res.redirect("/");
    }
});
// Logout
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/newAdd", function(req, res) {
    if (req.isAuthenticated()) {
        const item = req.body;
        Item.findOne({ itemName: item.itemName, person_email: item.person_email },
            function(err, foundList) {
                if (!err) {
                    const newItem = new Item({
                        itemName: item.itemName,
                        person_name: item.person_name,
                        person_email: item.person_email,
                        item_image_url: item.item_image_url,
                        item_description: item.item_description,
                        item_price: item.item_price,
                        person_contact: item.person_contact,
                    });
                    newItem.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    const newChat = new Chat({
                        itemName: item.itemName,
                        item_owner: item.person_email,
                        chats: []
                    });
                    newChat.save(function(err) {
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
app.post("/websiteReport", function(req, res) {
    if (req.isAuthenticated()) {
        const report = req.body;
        console.log(report);
        res.render('/');
    } else {
        res.redirect('/');
    }
});
app.get("/chatWithOwner", function(req, res) {
    const body = req.body;
});

app.get('/dev', function(req, res) {
    if (req.isAuthenticated()) {
        res.render('messages', { user: req.user });
    } else {
        res.render('messages', { user: null });
    }
});
app.get('/websiteStatus', function(req, res) {
    if (req.isAuthenticated()) {
        res.render('websiteStatus', { user: req.user, websites: [] });
    } else {
        res.render('websiteStatus', { user: null, websites: [] });
    }
});
app.get('/chat', function(req, res) {
    const body = req.body;
    // const chatSchema = new mongoose.Schema({
    //   item_name: String,
    //   item_owner: String,
    //   chats: [
    //     {
    //       buyer: String,
    //       msg: [
    //         {
    //           time: Date,
    //           conv: String,
    //         },
    //       ],
    //     },
    //   ],
    // });
    Chat.findOne({ item_name: body.item_name, item_owner: body.person_email, "Item.chats.buyer": body.buyer_email },
        function(err, found) {
            if (err) console.log(err);
            else if (found.length == 0) {
                const com = {
                    buyer: req.user.name,
                    msg: [],
                }
            } else {
                res.render("chat", { user: req.user, chats: found });
            }
        });
});
app.listen(process.env.PORT || 8080, function() {
    console.log("Server running on port 8080");
});