const { validationResult } = require("express-validator");
const pool = require("../db/pool");

async function getOrCreateLikedPlaylist(userId) {
  const checkResult = await pool.query(
    "SELECT id FROM playlists WHERE user_id = $1 AND name = $2 LIMIT 1",
    [userId, "Liked"]
  );
  if (checkResult.rows.length > 0) {
    return checkResult.rows[0].id;
  }
  const insertResult = await pool.query(
    "INSERT INTO playlists (user_id, name) VALUES ($1, 'Liked') RETURNING id",
    [userId]
  );
  return insertResult.rows[0].id;
}

exports.getLikedVideos = async (req, res) => {
  const { userId } = req.params;

  try {
    const videosResult = await pool.query(
      `
      SELECT 
        v.*, 
        u.username, 
        u.profile_pic_url,
        COUNT(vl2.id) AS likes_count
      FROM video_likes vl
      JOIN videos v ON vl.video_id = v.id
      JOIN users u ON v.user_id = u.id
      LEFT JOIN video_likes vl2 ON vl2.video_id = v.id
      WHERE vl.user_id = $1
      GROUP BY v.id, u.id
      `,
      [userId]
    );

    return res.json(videosResult.rows);
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    return res.status(500).json({ error: "Failed to fetch liked videos" });
  }
};

exports.createPlaylist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name } = req.body;
  const userId = req.userId;
  try {
    const result = await pool.query(
      "INSERT INTO playlists (user_id, name) VALUES ($1, $2) RETURNING id",
      [userId, name]
    );
    res.json({ message: "Playlist created!", playlistId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlaylists = async (req, res) => {
  const userId = req.userId;
  try {
    const result = await pool.query(
      "SELECT * FROM playlists WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlaylistVideos = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { playlistId } = req.params;

  try {
    const playlistCheck = await pool.query(
      "SELECT * FROM playlists WHERE id = $1",
      [playlistId]
    );
    if (playlistCheck.rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const videosResult = await pool.query(
      `SELECT v.*
       FROM playlist_videos pv
       JOIN videos v ON pv.video_id = v.id
       WHERE pv.playlist_id = $1
       ORDER BY v.id DESC`,
      [playlistId]
    );

    return res.json(videosResult.rows);
  } catch (error) {
    console.error("Error fetching playlist videos:", error);
    return res.status(500).json({ error: "Failed to fetch playlist videos" });
  }
};

exports.saveToLiked = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { videoId } = req.body;
  const userId = req.userId;
  if (!userId || !videoId) {
    return res.status(400).json({ error: "userId and videoId are required" });
  }

  try {
    const likedId = await getOrCreateLikedPlaylist(userId);

    await pool.query(
      `INSERT INTO playlist_videos (playlist_id, video_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [likedId, videoId]
    );

    return res.status(200).json({ message: "Video saved to liked!" });
  } catch (error) {
    console.error("Error saving liked:", error);
    return res.status(500).json({ error: "Failed to save video to liked" });
  }
};
