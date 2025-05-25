const express = require("express");
const { body, param } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getComments,
  createComment,
} = require("../controllers/commentController");

const router = express.Router();

// GET all comments for a video
router.get(
  "/api/videos/:videoId/comments",
  [param("videoId").isInt().withMessage("videoId must be an integer")],
  getComments
);

// POST a new comment (must be logged in)
router.post(
  "/api/videos/:videoId/comments",
  authMiddleware,
  [
    param("videoId").isInt().withMessage("videoId must be an integer"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  createComment
);

module.exports = router;
