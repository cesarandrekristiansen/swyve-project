const express = require("express");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const ctrl = require("../controllers/passwordController");

const router = express.Router();

const resetLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,
  message: { error: "Too many requests, try again in 1 minute." },
});

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Must be a valid email"),
  resetLimiter,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    try {
      await ctrl.forgotPassword(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/reset-password",
  body("token").notEmpty().withMessage("Token is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be ≥ 8 characters"),
  resetLimiter,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    try {
      await ctrl.resetPassword(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
