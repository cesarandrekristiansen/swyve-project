// controllers/applyController.js

const pool = require("../db/pool");
const nodemailer = require("nodemailer");

// Reuse the same Mandrill transporter you used for password resets:
const transporter = nodemailer.createTransport({
  host: "smtp.mandrillapp.com", // same as in PasswordController.js
  port: 587,
  secure: false,
  auth: {
    user: process.env.MANDRILL_USER, // e.g. your Mandrill SMTP username
    pass: process.env.MANDRILL_API_KEY, // Mandrill SMTP key
  },
  tls: { rejectUnauthorized: false },
});

exports.applyCreator = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    // 1) Verify that req.userId matches the param, or reject:
    if (req.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You may only apply for your own account." });
    }

    // 2) Fetch the user’s current application_sent, username, and email from DB:
    const userResult = await pool.query(
      "SELECT username, email, application_sent FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const { username, email, application_sent } = userResult.rows[0];

    // 3) If they already applied, reject:
    if (application_sent) {
      return res
        .status(400)
        .json({ error: "You have already applied. Please wait for approval." });
    }

    // 4) Validate the request body:
    //    - req.body.message (text ≥ 10 chars)
    //    - req.body.socialLink (valid URL)
    //    - req.file must exist
    const { message, socialLink } = req.body;
    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        error: "Application message must be at least 10 characters.",
      });
    }
    if (!socialLink) {
      return res.status(400).json({ error: "Please provide a social link." });
    }
    // Simple URI sanity check:
    try {
      new URL(socialLink);
    } catch (_) {
      return res
        .status(400)
        .json({ error: "Please provide a valid URL for your social link." });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Please upload the required proof image." });
    }

    // 5) Build the email to send to your dev inbox:
    const mailOptions = {
      from: `"Swyve Applications" <${process.env.SMTP_USER}>`,
      to: process.env.CREATOR_APP_INBOX,
      subject: `New Creator Application: ${username} (ID ${userId})`,
      text: `
User ID       : ${userId}
Username      : ${username}
User Email    : ${email}
Social Link   : ${socialLink}

Message:
${message}

-- Proof image attached.
`,
      attachments: [
        {
          content: req.file.buffer,
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        },
      ],
    };

    // 6) Send the email to your dev/admin mailbox:
    await transporter.sendMail(mailOptions);

    // 7) (Optional) Send a “thanks, we got your application” email to the user:
    await transporter.sendMail({
      from: `"Swyve Support" <${process.env.SMTP_USER}>`,
      to: email, // applicant’s email
      subject: "Your Creator Application Was Received",
      text: `
Hi ${username},

Thanks for applying to become a Swyve Creator! We received your application and will review it soon. You’ll receive a follow‐up email once we’ve decided.

Best,
The Swyve Team
`,
    });

    // 8) UPDATE the database so that application_sent = true:
    await pool.query("UPDATE users SET application_sent = TRUE WHERE id = $1", [
      userId,
    ]);

    // 9) Return a 200 success to the frontend:
    return res.json({ message: "Application sent—thank you!" });
  } catch (err) {
    console.error("Error in applyCreator:", err);
    return res.status(500).json({ error: "Server error sending application." });
  }
};
