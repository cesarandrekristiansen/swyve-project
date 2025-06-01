const express = require("express");
const csrf = require("csurf");
const rateLimit = require("express-rate-limit");
const { forgotPassword, resetPassword } = require("../controllers/passwordController");

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 3, 
  message: "try agian soon",
});


router.post("/forgot-password", limiter, csrfProtection, forgotPassword);


router.post("/reset-password", limiter, csrfProtection, resetPassword);

module.exports = router;
