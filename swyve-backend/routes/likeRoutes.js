const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { likeVideo, unlikeVideo } = require("../controllers/likeController");

const router = express.Router();

router.post("/api/videos/:videoId/like", authMiddleware, likeVideo);
router.delete("/api/videos/:videoId/like", authMiddleware, unlikeVideo);

module.exports = router;
