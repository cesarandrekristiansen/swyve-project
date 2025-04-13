const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, png, gif) are allowed!"));
    }
  },
});

module.exports = uploadImage;
