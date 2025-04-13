const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  uploadVideo,
  saveMetadata,
  getAllVideos,
  getUserVideos,
} = require("../controllers/videoController");

const router = express.Router();
const uploadVideo = require("../middleware/multerVideoConfig");
const { body, param } = require("express-validator");

// Upload video
router.post(
  "/api/upload-video",
  authMiddleware,
  uploadVideo.single("video"),
  uploadVideo
);

// Save video metadata
router.post(
  "/api/videos",
  authMiddleware,
  [
    body("title").trim().escape().notEmpty().withMessage("title is required"),
    body("videoUrl").isURL().withMessage("videoUrl must be a valid URL"),
    body("tags").optional().trim().escape(),
  ],
  saveMetadata
);
router.get("/api/videos", getAllVideos);
router.get(
  "/api/users/:userId/videos",
  authMiddleware,
  [param("userId").isInt().withMessage("userId must be an integer")],
  getUserVideos
);

module.exports = router;
