const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  register,
  login,
  logout,
  getUser,
} = require("../controllers/authController");

const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("username")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Username is required"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.post("/logout", authMiddleware, logout);

router.get("/api/me", authMiddleware, getUser);

module.exports = router;
