const pool = require("../db/pool");
const { validationResult } = require("express-validator");
const supabase = require("../services/supabaseService");

// Get /api/users/:userId
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const userResult = await pool.query(
      "SELECT id, username, bio, profile_pic_url, cover_pic_url FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userRow = userResult.rows[0];

    const followersResult = await pool.query(
      "SELECT COUNT(*) AS count FROM follows WHERE followed_id = $1",
      [userId]
    );
    const followersCount = parseInt(followersResult.rows[0].count, 10);

    const followingResult = await pool.query(
      "SELECT COUNT(*) AS count FROM follows WHERE follower_id = $1",
      [userId]
    );
    const followingCount = parseInt(followingResult.rows[0].count, 10);

    const totalLikesResult = await pool.query(
      `
      SELECT COUNT(vl.id) AS total
      FROM videos v
      LEFT JOIN video_likes vl ON vl.video_id = v.id
      WHERE v.user_id = $1
      `,
      [userId]
    );
    const totalLikesCount = parseInt(totalLikesResult.rows[0].total, 10);

    // Return the combined info
    return res.json({
      id: userRow.id,
      username: userRow.username,
      bio: userRow.bio,
      profile_pic_url: userRow.profile_pic_url,
      cover_pic_url: userRow.cover_pic_url,
      followers: followersCount,
      following: followingCount,
      totalLikesCount,
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateUsername = async (req, res) => {
  // optional express-validator checks for username
  // e.g. body("username").trim().isLength({ min: 1, max: 30 })
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.userId;
  const { username } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, bio, profile_pic_url",
      [username, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ message: "Username updated", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating username:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateBio = async (req, res) => {
  // optional express-validator checks for bio
  // e.g. body("bio").trim().isLength({ max: 200 })
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.userId;
  const { bio } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET bio = $1 WHERE id = $2 RETURNING id, username, bio, profile_pic_url",
      [bio, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ message: "Bio updated", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating bio:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateProfilePic = async (req, res) => {
  // We assume you've used a multer middleware for single("profilePic") or something
  // so if there's no file, we handle that
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const userId = req.userId;

  try {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pics")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("profile-pics")
      .getPublicUrl(uploadData.path);

    if (urlError) {
      console.error("Supabase public URL error:", urlError);
      throw urlError;
    }

    const finalPicUrl = publicUrlData.publicUrl;

    const result = await pool.query(
      "UPDATE users SET profile_pic_url = $1 WHERE id = $2 RETURNING id, username, bio, profile_pic_url",
      [finalPicUrl, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "Profile picture updated",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating profile pic:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateCoverPic = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const userId = req.userId;

  try {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pics")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("profile-pics")
      .getPublicUrl(uploadData.path);

    if (urlError) {
      console.error("Supabase public URL error:", urlError);
      throw urlError;
    }

    const finalPicUrl = publicUrlData.publicUrl;

    const result = await pool.query(
      "UPDATE users SET cover_pic_url = $1 WHERE id = $2 RETURNING id, username, bio, cover_pic_url",
      [finalPicUrl, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "Cover picture updated",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating cover pic:", err);
    return res.status(500).json({ error: err.message });
  }
};
