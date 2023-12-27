const {Router} = require("express");

const websiteRoute = Router();

const Website = require("../schema/website");

websiteRoute.get("/websiteStatus", function (req, res) {
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
  
  websiteRoute.post("/websiteReport", function (req, res) {
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
  websiteRoute.post("/deleteStatus", function (req, res) {
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

module.exports = websiteRoute;