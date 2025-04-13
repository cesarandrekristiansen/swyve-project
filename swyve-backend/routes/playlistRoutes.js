const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createPlaylist,
  getPlaylists,
  getPlaylistVideos,
  saveToLiked,
  getLikedVideos,
} = require("../controllers/playlistController");

const { body, param } = require("express-validator");

const router = express.Router();

router.post(
  "/api/playlists",
  authMiddleware,
  [
    body("name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Playlist name cannot be empty"),
  ],
  createPlaylist
);

router.get("/api/playlists", authMiddleware, getPlaylists);

router.get(
  "/api/playlists/:playlistId/videos",
  authMiddleware,
  [param("playlistId").isInt().withMessage("Playlist ID must be an integer")],
  getPlaylistVideos
);

router.post(
  "/api/liked",
  authMiddleware,
  [body("videoId").isInt().withMessage("videoId must be an integer")],
  saveToLiked
);

router.get(
  "/api/users/:userId/liked",
  authMiddleware,
  [param("userId").isInt()],
  getLikedVideos
);

module.exports = router;
