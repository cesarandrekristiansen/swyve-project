const { validationResult } = require("express-validator");
const supabase = require("../services/supabaseService");
const pool = require("../db/pool");

exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    const result = await pool.query(
      `SELECT id, username, profile_pic_url FROM users WHERE LOWER(username) LIKE LOWER($1)`,
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ error: "Failed to search users" });
  }
};

exports.searchHashtags = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    const result = await pool.query(
      `SELECT tags FROM videos WHERE LOWER(tags) LIKE LOWER($1)`,
      [`%${query}%`]
    );

    const tagCounts = {};

    result.rows.forEach(({ tags }) => {
      const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      tagArray.forEach((tag) => {
        if (tag.includes(query.toLowerCase())) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    });

    const response = Object.entries(tagCounts).map(([tag, count]) => ({
      tag,
      count,
    }));

    res.json(response);
  } catch (err) {
    console.error("Hashtag search error:", err);
    res.status(500).json({ error: "Failed to search hashtags" });
  }
};

exports.getVideosByHashtag = async (req, res) => {
  const { tag } = req.params;
  const userId = req.userId; // <--- from cookie middleware

  if (!tag) return res.status(400).json({ error: "Tag required" });

  try {
    const result = await pool.query(
      `
      SELECT 
        v.*, 
        u.username, 
        u.profile_pic_url,
        COUNT(vl.id) AS likes_count
      FROM videos v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN video_likes vl ON vl.video_id = v.id
      WHERE LOWER(v.tags) LIKE LOWER($1)
      GROUP BY v.id, u.id
      `,
      [`%${tag}%`]
    );

    const filtered = result.rows.filter((row) =>
      row.tags
        .toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .includes(tag.toLowerCase())
    );

    // get liked videos by current user
    let likedVideoIds = new Set();
    if (userId) {
      const likedResult = await pool.query(
        `SELECT video_id FROM video_likes WHERE user_id = $1`,
        [userId]
      );
      likedVideoIds = new Set(likedResult.rows.map((r) => r.video_id));
    }

    const enriched = filtered.map((vid) => ({
      ...vid,
      isliked: likedVideoIds.has(vid.id),
      likes_count: parseInt(vid.likes_count, 10),
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching videos by hashtag:", err);
    res.status(500).json({ error: "Failed to fetch videos by hashtag" });
  }
};

exports.getTopHashtags = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT LOWER(tag) AS tag, COUNT(*) AS count FROM (
          SELECT TRIM(UNNEST(string_to_array(tags, ','))) AS tag
          FROM videos
          WHERE tags IS NOT NULL AND tags <> ''
        ) AS all_tags
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 10;
      `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching top hashtags:", err);
    res.status(500).json({ error: "Failed to fetch top hashtags" });
  }
};
