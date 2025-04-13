const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createPlaylist,
  getPlaylists,
  getPlaylistVideos,
  saveToFavorites,
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
  "/api/favorites",
  authMiddleware,
  [body("videoId").isInt().withMessage("videoId must be an integer")],
  saveToFavorites
);

module.exports = router;
