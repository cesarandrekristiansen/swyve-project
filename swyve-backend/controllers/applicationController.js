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
  tls: { rejectUnauthorized: false },
});

exports.applyCreator = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (req.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You may only apply for your own account." });
    }

    const userResult = await pool.query(
      "SELECT username, email, application_sent FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const { username, email, application_sent } = userResult.rows[0];

    if (application_sent) {
      return res
        .status(400)
        .json({ error: "You have already applied. Please wait for approval." });
    }

    const { message, socialLink } = req.body;
    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        error: "Application message must be at least 10 characters.",
      });
    }
    if (!socialLink) {
      return res.status(400).json({ error: "Please provide a social link." });
    }

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

    await transporter.sendMail(mailOptions);

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

    await pool.query("UPDATE users SET application_sent = TRUE WHERE id = $1", [
      userId,
    ]);

    return res.json({ message: "Application sent—thank you!" });
  } catch (err) {
    console.error("Error in applyCreator:", err);
    return res.status(500).json({ error: "Server error sending application." });
  }
};
