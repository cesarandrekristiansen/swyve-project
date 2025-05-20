const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateUsername,
  updateBio,
  updateProfilePic,
  updateCoverPic,
} = require("../controllers/userController");
const { body, param } = require("express-validator");

const uploadImage = require("../middleware/multerImageConfig");

const router = express.Router();

router.get("/api/users/:userId", getUserProfile);

router.put(
  "/api/users/me/username",
  authMiddleware,
  [
    body("username")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Username cannot be empty")
      .isLength({ max: 30 })
      .withMessage("Username too long"),
  ],
  updateUsername
);

router.put(
  "/api/users/me/bio",
  authMiddleware,
  [
    body("bio")
      .trim()
      .escape()
      .isLength({ max: 200 })
      .withMessage("Bio too long (200 chars max)"),
  ],
  updateBio
);

router.put(
  "/api/users/me/profile-pic",
  authMiddleware,
  uploadImage.single("profilePic"),
  updateProfilePic
);

router.put(
  "/api/users/me/cover-pic",
  authMiddleware,
  uploadImage.single("coverPic"),
  updateCoverPic
);

module.exports = router;
