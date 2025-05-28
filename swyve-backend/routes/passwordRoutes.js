const express = require("express");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const { body } = require("express-validator");
const ctrl = require("../controllers/passwordController");

const router = express.Router();

router.use(cookieParser());
const csrfProtection = csrf({ cookie: true });


const resetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { error: "Too many password reset attempts. Try again in a minute." },
});

router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

router.post(
  "/forgot-password",
  csrfProtection,
  body("email").isEmail().withMessage("Must be a valid email."),
  ctrl.forgotPassword
);

router.post(
  "/reset-password",
  cookieParser(),
  csrfProtection,
  resetLimiter,
  body("token").notEmpty().withMessage("Token missing"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Atleast 8 signs")
    .matches(/[A-Z]/)
    .withMessage("Must include uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Must include lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Must include a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Must include a symbol"),
  ctrl.resetPassword
);

module.exports = router;
