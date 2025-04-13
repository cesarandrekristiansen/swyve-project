const multer = require("multer");

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const allowedMimeTypes = ["video/mp4", "video/webm", "video/ogg"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .mp4, .webm, and .ogg video files are allowed!"));
    }
  },
});

module.exports = upload;
