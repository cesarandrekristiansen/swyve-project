const pool = require("../db/pool");

exports.followUser = async (req, res) => {
  const followerId = req.userId;
  const { targetUserId } = req.params;

  if (parseInt(targetUserId) === followerId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  try {
    await pool.query(
      `INSERT INTO follows (follower_id, followed_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [followerId, targetUserId]
    );
    return res.json({ message: "Followed user successfully" });
  } catch (error) {
    console.error("Error following user:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  const followerId = req.userId;
  const { targetUserId } = req.params;

  try {
    await pool.query(
      "DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2",
      [followerId, targetUserId]
    );
    return res.json({ message: "Unfollowed user successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  const { userId } = req.params;
  try {
    // find all "follower_id" who follow userId
    const result = await pool.query(
      `SELECT u.id, u.username, u.profile_pic_url
         FROM follows f
         JOIN users u ON f.follower_id = u.id
         WHERE f.followed_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFollowing = async (req, res) => {
  const { userId } = req.params;
  try {
    // find all "followed_id" who userId follows
    const result = await pool.query(
      `SELECT u.id, u.username, u.profile_pic_url
         FROM follows f
         JOIN users u ON f.followed_id = u.id
         WHERE f.follower_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: error.message });
  }
};
