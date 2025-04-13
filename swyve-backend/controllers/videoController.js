const { validationResult } = require("express-validator");
const supabase = require("../services/supabaseService");
const pool = require("../db/pool");

exports.uploadVideo = async (req, res) => {
  console.log("uploadVideo controller is loaded!");
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    console.log("fileName:", fileName);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("videos")
      .getPublicUrl(uploadData.path);

    if (urlError) {
      console.error("Supabase public URL error:", urlError);
      throw urlError;
    }

    const finalPublicUrl = publicUrlData.publicUrl;
    console.log("finalPublicUrl:", finalPublicUrl);

    return res.status(200).json({ videoUrl: finalPublicUrl });
  } catch (err) {
    console.error("Error uploading video:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.saveMetadata = async (req, res) => {
  // Check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, thumbnail, duration, tags, embed_code, videoUrl } = req.body;
  const userId = req.userId;
  try {
    const result = await pool.query(
      "INSERT INTO videos (title, url, thumbnail, duration, tags, embed_code, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, videoUrl, thumbnail, duration, tags, embed_code, userId]
    );
    res.json({ message: "Video metadata saved", video: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM videos ORDER BY RANDOM()");
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getUserVideos = async (req, res) => {
  // Check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { userId } = req.params;
  console.log("Fetching videos for user:", userId);

  try {
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const videosResult = await pool.query(
      "SELECT * FROM videos WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    return res.json(videosResult.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
