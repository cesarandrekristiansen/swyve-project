const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const pool = require("../db/pool");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mandrillapp.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MANDRILL_USER,
    pass: process.env.MANDRILL_API_KEY,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP-verify failed", err);
  } else {
    console.log("SMTP OK");
  }
});

exports.forgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;
  try {
    const u = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (!u.rows.length) {
      return res.json({ message: "If email exists, a reset link has been sent." });
    }
    const userId = u.rows[0].id;

    await pool.query("DELETE FROM password_resets WHERE user_id = $1", [userId]);

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expires]
    );

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Password",
      text: `Hi!\n\nClick here to reset your password:\n${link}\n\nThis link expires in 1 hour.`,
    });

    res.json({ message: "If email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { token, newPassword } = req.body;
  try {
    const pr = await pool.query(
      "SELECT user_id, expires_at FROM password_resets WHERE token = $1",
      [token]
    );
    if (!pr.rows.length || new Date() > pr.rows[0].expires_at) {
      return res.status(400).json({ error: "Token is invalid or expired." });
    }
    const userId = pr.rows[0].user_id;

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hash, userId]);

    await pool.query("DELETE FROM password_resets WHERE user_id = $1", [userId]);

    res.json({ message: "Password has been reset." });
  } catch (err) {
    next(err);
  }
};
