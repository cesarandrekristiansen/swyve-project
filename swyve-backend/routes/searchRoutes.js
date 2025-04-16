const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  searchUsers,
  searchHashtags,
  getVideosByHashtag,
  getTopHashtags,
} = require("../controllers/searchController");

const router = express.Router();

router.get("/api/search/users", searchUsers);

router.get("/api/search/hashtags", searchHashtags);

router.get("/api/hashtags/:tag/videos", authMiddleware, getVideosByHashtag);

router.get("/api/hashtags/top", getTopHashtags);

module.exports = router;
