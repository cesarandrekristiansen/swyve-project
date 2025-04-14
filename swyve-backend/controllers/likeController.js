const pool = require("../db/pool");

exports.likeVideo = async (req, res) => {
  const userId = req.userId; // from authMiddleware
  const { videoId } = req.params;

  try {
    // Insert a row if not already existing
    await pool.query(
      `INSERT INTO video_likes (video_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
      [videoId, userId]
    );
    res.json({ message: "Video liked" });
  } catch (error) {
    console.error("Error liking video:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.unlikeVideo = async (req, res) => {
  const userId = req.userId;
  const { videoId } = req.params;

  try {
    await pool.query(
      "DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2",
      [videoId, userId]
    );
    res.json({ message: "Video unliked" });
  } catch (error) {
    console.error("Error unliking video:", error);
    res.status(500).json({ error: error.message });
  }
};
