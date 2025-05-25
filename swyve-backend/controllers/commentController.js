const { validationResult } = require("express-validator");
const pool = require("../db/pool");

exports.getComments = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const videoId = parseInt(req.params.videoId, 10);

  try {
    const result = await pool.query(
      `
      SELECT c.id,
             c.content,
             c.created_at,
             u.id AS user_id,
             u.username,
             u.profile_pic_url
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.video_id = $1
      ORDER BY c.created_at ASC
      `,
      [videoId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const videoId = parseInt(req.params.videoId, 10);
  const userId = req.userId;
  const { content } = req.body;

  try {
    const insert = await pool.query(
      `
      INSERT INTO comments (video_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at
      `,
      [videoId, userId, content]
    );
    const comment = insert.rows[0];

    // fetch the user’s info to return in one payload
    const userRes = await pool.query(
      "SELECT username, profile_pic_url FROM users WHERE id = $1",
      [userId]
    );
    const user = userRes.rows[0];

    res.status(201).json({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user_id: userId,
      username: user.username,
      profile_pic_url: user.profile_pic_url,
    });
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: err.message });
  }
};
