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
    pass: process.env.MANDRILL_API_KEY
  },
  tls: {
    rejectUnauthorized: false
  }
});
transporter.verify((err, success) => {
    if (err) {
      console.error("SMTP-verify fail", err);
    } else {
      console.log("SMTP OK");
    }
  });

const FRONTEND = process.env.FRONTEND_URL;

exports.forgotPassword = async (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  
    const { email } = req.body;
    try {

      const u = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (!u.rows.length) {
        return res.json({ message: "if email, sends mail" });
      }
      const userId = u.rows[0].id;
  
      // token for link
      const token   = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await pool.query("DELETE FROM password_resets WHERE user_id = $1", [userId]);
      await pool.query(
        "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2,$3)",
        [userId, token, expires]
      );
  
      const link = `${FRONTEND}/reset-password?token=${token}`;
      const mailOptions = {
        from: `"Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Reset Password",
        text: [
          `Hi!`,
          ``,
          `Click here to reset your password:`,
          `${link}`,
          ``,
          `This link expierce in 1 hour.`
        ].join("\n")
      };
  
      console.log("trying to send email with mail options", mailOptions);
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info);
      } catch (mailErr) {
        console.error(" Could not send email:", mailErr);
      }
  
      res.json({ message: "If email exits, sends email." });
    } catch (err) {
      next(err);
    }
  };
  

exports.resetPassword = async (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

  const { token, newPassword } = req.body;
  try {
    const pr = await pool.query(
      "SELECT user_id, expires_at FROM password_resets WHERE token = $1",
      [token]
    );
    if (!pr.rows.length || new Date() > pr.rows[0].expires_at) {
      return res.status(400).json({ error: "token expired" });
    }
    const userId = pr.rows[0].user_id;

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hash,
      userId,
    ]);

    await pool.query("DELETE FROM password_resets WHERE user_id = $1", [userId]);

    res.json({ message: "Password Reset!" });
  } catch (err) {
    next(err);
  }
};
