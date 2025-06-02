const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  uploadVideo,
  saveMetadata,
  getAllVideos,
  getUserVideos,
  getFollowingVideos,
  getVideoCount,
  deleteVideo,
} = require("../controllers/videoController");

const router = express.Router();
const uploadVideoMulter = require("../middleware/multerVideoConfig");
const { body, param } = require("express-validator");

// Upload video
router.post(
  "/api/upload-video",
  authMiddleware,
  uploadVideoMulter.single("video"),
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
router.get("/api/videos/count", getVideoCount)

// Get videos from users you follow
router.get("/api/videos/following", authMiddleware, getFollowingVideos);

// Delete video
router.delete("/api/videos/:id", authMiddleware, deleteVideo);

module.exports = router;
