const multer = require("multer");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploaded_docs/");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        req.body.owner_email +
          "__" +
          String(Date.now()) +
          "." +
          file.mimetype.split("/")[1]
      );
    },
  });
  var upload = multer({ storage: storage });

 module.exports = upload;