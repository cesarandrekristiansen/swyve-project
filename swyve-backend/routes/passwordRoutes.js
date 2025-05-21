const express = require("express");
const { body } = require("express-validator");
const ctrl = require("../controllers/passwordController");

const router = express.Router();

const FRONTEND = process.env.FRONTEND_URL;

router.post(
  `${FRONTEND}/forgot-password`,
  body("email").isEmail().withMessage("Må være en gyldig e-post"),
  ctrl.forgotPassword
);

router.post(
  `${FRONTEND}/reset-password`,
  body("token").notEmpty().withMessage("Token mangler"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Passord må være minst 6 tegn"),
  ctrl.resetPassword
);

module.exports = router;
