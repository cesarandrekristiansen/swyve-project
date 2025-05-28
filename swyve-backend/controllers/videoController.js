const { validationResult } = require("express-validator");
const supabase = require("../services/supabaseService");
const pool = require("../db/pool");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

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
    cache.del("allVideos");

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
    cache.del("allVideos");
    cache.del(`userVideos:${userId}`);
    res.json({ message: "Video metadata saved", video: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllVideos = async (req, res) => {
  const userId = req.userId; // might be undefined if not logged in
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;  

  const cacheKey = `allVideos:${limit}:${offset}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log("getAllVideos: serving from cache");
    return res.json(cached);
  }       

  try {
        // 1) fetch basic info plus total likes
    // We'll group by v.id, then do a COUNT(*) from video_likes
    const result = await pool.query(
      `
      SELECT
        v.id,
        v.title,
        v.url,
        v.user_id,
        u.username,
        u.profile_pic_url,
        COUNT(DISTINCT vl.id) AS likes_count,
        COUNT(DISTINCT c.id) AS comment_count
      FROM videos v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN video_likes vl ON vl.video_id = v.id
      LEFT JOIN comments c ON c.video_id = v.id 
      GROUP BY v.id, u.id
      ORDER BY RANDOM()
      LIMIT $1
      OFFSET $2                                              
      `,
      [limit, offset]                                         
    );

    let videos = result.rows; // each row has v.*, u.*, plus likes_count

        // 2) if userId is present, figure out which videos this user liked
    if (userId) {
      const likedResult = await pool.query(
        `SELECT video_id FROM video_likes WHERE user_id = $1`,
        [userId]
      );
      const likedVideoIds = new Set(likedResult.rows.map((r) => r.video_id));

           // 3) merge isLiked into each video
      videos = videos.map((vid) => ({
        ...vid,
        isliked: likedVideoIds.has(parseInt(vid.id, 10)),
      }));
    } else {
            // not logged in => isliked = false
      videos = videos.map((vid) => ({ ...vid, isliked: false }));
    }

    // parse likes_count from string to integer
    videos = videos.map((vid) => ({
      ...vid,
      likes_count: parseInt(vid.likes_count, 10),
      comment_count: parseInt(vid.comment_count, 10),
    }));
    cache.set(cacheKey, videos);
    res.json(videos);
  } catch (err) {
    console.error("Error in getAllVideos:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserVideos = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.params;
  const viewerId = req.userId;
  const cacheKey = `userVideos:${userId}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`getUserVideos: serving user ${userId} from cache`);
    return res.json(cached);
  }

  console.time("getUserVideos_db");

  try {
    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const videosResult = await pool.query(
      `
      SELECT 
        v.*, 
        u.username, 
        u.profile_pic_url,
        COUNT(DISTINCT vl.id) AS likes_count,
        COUNT(DISTINCT c.id) AS comment_count

      FROM videos v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN video_likes vl ON vl.video_id = v.id
      LEFT JOIN comments c ON c.video_id = v.id
      WHERE v.user_id = $1
      GROUP BY v.id, u.id
      ORDER BY v.id DESC
      `,
      [userId]
    );
    console.timeEnd("getUserVideos_db");
    let videos = videosResult.rows;

    // add isliked
    if (viewerId) {
      const liked = await pool.query(
        `SELECT video_id FROM video_likes WHERE user_id = $1`,
        [viewerId]
      );
      const likedIds = new Set(liked.rows.map((r) => r.video_id));
      videos = videos.map((vid) => ({
        ...vid,
        isliked: likedIds.has(vid.id),
        likes_count: parseInt(vid.likes_count, 10),
        comment_count: parseInt(vid.comment_count, 10),
      }));
    } else {
      videos = videos.map((vid) => ({
        ...vid,
        isliked: false,
        likes_count: parseInt(vid.likes_count, 10),
        comment_count: parseInt(vid.comment_count, 10),
      }));
    }
    cache.set(cacheKey, videos);
    res.json(videos);
  } catch (err) {
    console.error("Error fetching user videos:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getFollowingVideos = async (req, res) => {
  const userId = req.userId; // set by authMiddleware
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const cacheKey = `followingVideos:${userId}:${limit}:${offset}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`getFollowingVideos: serving from cache for user ${userId}`);
    return res.json(cached);
  }

  console.time("getFollowingVideos_db");

  try {
    // 1) Fetch videos from users this user follows
    const result = await pool.query(
      `
      SELECT
        v.id,
        v.title,
        v.url,
        v.user_id,
        u.username,
        u.profile_pic_url,
        COUNT(DISTINCT vl.id) AS likes_count,
        COUNT(DISTINCT c.id) AS comment_count
      FROM follows f
      JOIN videos v     ON v.user_id = f.followed_id
      JOIN users u      ON u.id      = v.user_id
      LEFT JOIN video_likes vl ON vl.video_id = v.id
      LEFT JOIN comments c ON c.video_id = v.id
      WHERE f.follower_id = $1
      GROUP BY v.id, u.id
      ORDER BY v.id DESC            -- newest first
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    console.timeEnd("getFollowingVideos_db");
    let videos = result.rows;

    // 2) Annotate with isliked
    if (userId) {
      const likedResult = await pool.query(
        `SELECT video_id FROM video_likes WHERE user_id = $1`,
        [userId]
      );
      const likedSet = new Set(likedResult.rows.map((r) => r.video_id));
      videos = videos.map((v) => ({
        ...v,
        isliked: likedSet.has(v.id),
        likes_count: parseInt(v.likes_count, 10),
        comment_count: parseInt(v.comment_count, 10),
      }));
    }
    cache.set(cacheKey, videos);
    res.json(videos);
  } catch (err) {
    console.error("Error in getFollowingVideos:", err);
    res.status(500).json({ error: err.message });
  }
};
