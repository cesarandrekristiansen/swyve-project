const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Create a PostgreSQL connection pool using the Supabase connection string
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
});

// Test the database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Postgres connection error:", err);
  } else {
    console.log("Postgres connected:", res.rows);
  }
});

// Configure CORS to allow requests from your frontend on Render
const corsOptions = {
  origin: [
    "https://swyve-frontend.onrender.com",
    "http://localhost:3000",
    "https://swyve.io",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// Parse JSON bodies for incoming requests
app.use(bodyParser.json());

async function getOrCreateFavoritesPlaylist(userId, pool) {
  // 1) Check if a "Favorites" playlist already exists for this user
  const checkResult = await pool.query(
    "SELECT id FROM playlists WHERE user_id = $1 AND name = $2 LIMIT 1",
    [userId, "Favorites"]
  );
  if (checkResult.rows.length > 0) {
    // Found it
    return checkResult.rows[0].id;
  }

  // 2) Create it if it doesn't exist
  const insertResult = await pool.query(
    "INSERT INTO playlists (user_id, name) VALUES ($1, $2) RETURNING id",
    [userId, "Favorites"]
  );
  return insertResult.rows[0].id;
}

/* ============================================================
   1. User Registration Endpoint
   ============================================================ */
app.post("/register", async (req, res) => {
  const { email, password, username } = req.body;
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert the new user into the "users" table and return the new user's ID
    const result = await pool.query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id",
      [email, hashedPassword, username]
    );
    res
      .status(201)
      .send({ message: "User registered successfully", id: result.rows[0].id });
  } catch (error) {
    // If the email already exists, PostgreSQL will throw a unique violation error (code 23505)
    if (error.code === "23505") {
      return res.status(400).send({ error: "User already exists" });
    }
    res.status(500).send({ error: "Error registering user" });
  }
});

/* ============================================================
   2. User Login Endpoint
   ============================================================ */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Query for the user with the given email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid credentials" });
    }
    // Generate a JWT token for the user
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).send({
      token,
      username: user.username,
      userId: user.id,
    });
  } catch (error) {
    res.status(500).send({ error: "Error logging in" });
  }
});

/* ============================================================
   3. Update User Streak Endpoint
   ============================================================ */
app.post("/streak", async (req, res) => {
  const { userId } = req.body;
  const today = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  try {
    // Check if a streak record exists for the user
    const result = await pool.query(
      "SELECT * FROM streaks WHERE user_id = $1",
      [userId]
    );
    let streak = result.rows[0];
    if (streak) {
      const lastActive = new Date(streak.last_active);
      const diffDays = Math.floor(
        (new Date(today) - lastActive) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        // If last active was yesterday, increment the streak
        const updateResult = await pool.query(
          "UPDATE streaks SET streak_count = streak_count + 1, last_active = $1 WHERE user_id = $2 RETURNING streak_count",
          [today, userId]
        );
        return res.json({
          message: "Streak updated!",
          streakCount: updateResult.rows[0].streak_count,
        });
      } else if (diffDays > 1) {
        // If more than a day has passed, reset the streak
        const resetResult = await pool.query(
          "UPDATE streaks SET streak_count = 1, last_active = $1 WHERE user_id = $2 RETURNING streak_count",
          [today, userId]
        );
        return res.json({
          message: "Streak reset!",
          streakCount: resetResult.rows[0].streak_count,
        });
      } else {
        // No change if the streak is already updated for today
        return res.json({
          message: "No change",
          streakCount: streak.streak_count,
        });
      }
    } else {
      // If no streak record exists, create one
      const insertResult = await pool.query(
        "INSERT INTO streaks (user_id, last_active, streak_count) VALUES ($1, $2, 1) RETURNING streak_count",
        [userId, today]
      );
      return res.json({
        message: "Streak started!",
        streakCount: insertResult.rows[0].streak_count,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   4. Create Playlist Endpoint
   ============================================================ */
app.post("/api/playlists", async (req, res) => {
  const { userId, name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO playlists (user_id, name) VALUES ($1, $2) RETURNING id",
      [userId, name]
    );
    res.json({ message: "Playlist created!", playlistId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   5. Get Playlists Endpoint
   ============================================================ */
app.get("/api/playlists", async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM playlists WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   6. Rewards Endpoint
   ============================================================ */
app.post("/api/rewards", async (req, res) => {
  const { userId, watchedVideos } = req.body;
  try {
    if (watchedVideos % 10 === 0) {
      // For simplicity, we’re just returning a message.
      res.json({ message: "Congratulations! You won a Premium Video!" });
    } else {
      res.json({ message: "Keep watching for a chance to win!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/videos", async (req, res) => {
  const { title, thumbnail, duration, tags, embed_code, videoUrl, userId } =
    req.body;
  try {
    const result = await pool.query(
      "INSERT INTO videos (title, url, thumbnail, duration, tags, embed_code, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, videoUrl, thumbnail, duration, tags, embed_code, userId]
    );
    res.json({ message: "Video metadata saved", video: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   GET Videos Endpoint
   ============================================================
   This endpoint fetches all video records from the "videos" table.
*/
app.get("/api/videos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM videos ORDER BY RANDOM()");
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2) NEW endpoint: only videos for a given user
app.get("/api/users/:userId/videos", async (req, res) => {
  const { userId } = req.params;
  console.log(userId);

  // Optional: check if the user actually exists
  const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
    userId,
  ]);
  if (userCheck.rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    // Fetch the user’s videos
    const videosResult = await pool.query(
      "SELECT * FROM videos WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    return res.json(videosResult.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/favorites", async (req, res) => {
  const { userId, videoId } = req.body;
  if (!userId || !videoId) {
    return res.status(400).json({ error: "userId and videoId are required" });
  }

  try {
    // 1) Get or create the user's "Favorites" playlist
    const favoritesId = await getOrCreateFavoritesPlaylist(userId, pool);

    // 2) Insert (playlist_id, video_id) into playlist_videos
    //    Use "ON CONFLICT DO NOTHING" if you added the unique constraint
    await pool.query(
      `INSERT INTO playlist_videos (playlist_id, video_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [favoritesId, videoId]
    );

    return res.status(200).json({ message: "Video saved to favorites!" });
  } catch (error) {
    console.error("Error saving favorite:", error);
    return res.status(500).json({ error: "Failed to save video to favorites" });
  }
});

// GET /api/playlists/:playlistId/videos
app.get("/api/playlists/:playlistId/videos", async (req, res) => {
  const { playlistId } = req.params;

  try {
    // Optional: verify the playlist exists
    const playlistCheck = await pool.query(
      "SELECT * FROM playlists WHERE id = $1",
      [playlistId]
    );
    if (playlistCheck.rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Fetch the videos for this playlist by joining playlist_videos and videos
    const videosResult = await pool.query(
      `
      SELECT v.*
      FROM playlist_videos pv
      JOIN videos v ON pv.video_id = v.id
      WHERE pv.playlist_id = $1
      ORDER BY v.id DESC
    `,
      [playlistId]
    );

    return res.json(videosResult.rows);
  } catch (error) {
    console.error("Error fetching playlist videos:", error);
    return res.status(500).json({ error: "Failed to fetch playlist videos" });
  }
});

/* ============================================================
   7. (Placeholder) Video Upload Endpoint using Supabase Storage
   ============================================================
   // This endpoint will be implemented later when integrating Supabase Storage.
   // For now, you can leave this as a placeholder.
   // Example:
   // app.post('/api/upload-video', uploadVideoRouter);
*/

// Require the upload router and mount it
const uploadVideoRouter = require("./uploadVideo");
app.use(uploadVideoRouter);

/* ============================================================
   Start the Server
   ============================================================ */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
