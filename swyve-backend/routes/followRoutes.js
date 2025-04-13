const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require("../controllers/followController");

const router = express.Router();

// Follow
router.post("/api/follow/:targetUserId", authMiddleware, followUser);

// Unfollow
router.delete("/api/follow/:targetUserId", authMiddleware, unfollowUser);

// Get followers and following
router.get("/api/users/:userId/followers", authMiddleware, getFollowers);
router.get("/api/users/:userId/following", authMiddleware, getFollowing);

module.exports = router;
