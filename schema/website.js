const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    website_url: String,
    report_type: String,
    error_description: String,
    email: String,
    date: Date,
});

const Website = mongoose.model("website", websiteSchema);
module.exports = Website;
