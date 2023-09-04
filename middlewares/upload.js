const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirTmp = path.join(__dirname, "../tmp");
    console.log("path = ", dirTmp);
    cb(null, dirTmp);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
