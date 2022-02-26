require('dotenv').config();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const express = require("express");
const ejs = require("ejs")
const mongoose = require("mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
// const _ = require('lodash');
// const moment = require("moment");
require('https').globalAgent.options.rejectUnauthorized = false;
const mongoStore = require("connect-mongo");
const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
  res.render('home');
});

// about page
app.get('/about', function(req, res) {
  res.render('pages/about');
});

app.listen(process.env.PORT || 8080, function(){
  console.log("Server running on port 8080" );
});
