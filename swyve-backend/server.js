const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });
  

// Create a PostgreSQL connection pool using the Supabase connection string
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING, 
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Postgres connection error:', err);
  } else {
    console.log('Postgres connected:', res.rows);
  }
});

// Configure CORS to allow requests from your frontend on Render
const corsOptions = {
  origin: "https://swyve-frontend.onrender.com",
  //origin: "http://localhost:3000/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// Parse JSON bodies for incoming requests
app.use(bodyParser.json());

/* ============================================================
   1. User Registration Endpoint
   ============================================================ */
app.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert the new user into the "users" table and return the new user's ID
    const result = await pool.query(
      'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, username]
    );
    res.status(201).send({ message: 'User registered successfully', id: result.rows[0].id });
  } catch (error) {
    // If the email already exists, PostgreSQL will throw a unique violation error (code 23505)
    if (error.code === '23505') {
      return res.status(400).send({ error: 'User already exists' });
    }
    res.status(500).send({ error: 'Error registering user' });
  }
});

/* ============================================================
   2. User Login Endpoint
   ============================================================ */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Query for the user with the given email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid credentials' });
    }
    // Generate a JWT token for the user
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).send({ token, username: user.username });
  } catch (error) {
    res.status(500).send({ error: 'Error logging in' });
  }
});

/* ============================================================
   3. Update User Streak Endpoint
   ============================================================ */
app.post('/streak', async (req, res) => {
  const { userId } = req.body;
  const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
  try {
    // Check if a streak record exists for the user
    const result = await pool.query('SELECT * FROM streaks WHERE user_id = $1', [userId]);
    let streak = result.rows[0];
    if (streak) {
      const lastActive = new Date(streak.last_active);
      const diffDays = Math.floor((new Date(today) - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        // If last active was yesterday, increment the streak
        const updateResult = await pool.query(
          'UPDATE streaks SET streak_count = streak_count + 1, last_active = $1 WHERE user_id = $2 RETURNING streak_count',
          [today, userId]
        );
        return res.json({ message: 'Streak updated!', streakCount: updateResult.rows[0].streak_count });
      } else if (diffDays > 1) {
        // If more than a day has passed, reset the streak
        const resetResult = await pool.query(
          'UPDATE streaks SET streak_count = 1, last_active = $1 WHERE user_id = $2 RETURNING streak_count',
          [today, userId]
        );
        return res.json({ message: 'Streak reset!', streakCount: resetResult.rows[0].streak_count });
      } else {
        // No change if the streak is already updated for today
        return res.json({ message: 'No change', streakCount: streak.streak_count });
      }
    } else {
      // If no streak record exists, create one
      const insertResult = await pool.query(
        'INSERT INTO streaks (user_id, last_active, streak_count) VALUES ($1, $2, 1) RETURNING streak_count',
        [userId, today]
      );
      return res.json({ message: 'Streak started!', streakCount: insertResult.rows[0].streak_count });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   4. Create Playlist Endpoint
   ============================================================ */
app.post('/api/playlists', async (req, res) => {
  const { userId, name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO playlists (user_id, name) VALUES ($1, $2) RETURNING id',
      [userId, name]
    );
    res.json({ message: 'Playlist created!', playlistId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   5. Get Playlists Endpoint
   ============================================================ */
app.get('/api/playlists', async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query('SELECT * FROM playlists WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   6. Rewards Endpoint
   ============================================================ */
app.post('/api/rewards', async (req, res) => {
  const { userId, watchedVideos } = req.body;
  try {
    if (watchedVideos % 10 === 0) {
      // For simplicity, we’re just returning a message.
      res.json({ message: 'Congratulations! You won a Premium Video!' });
    } else {
      res.json({ message: 'Keep watching for a chance to win!' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/videos', async (req, res) => {
    const { title, thumbnail, duration, tags, embed_code, videoUrl } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO videos (title, url, thumbnail, duration, tags, embed_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, videoUrl, thumbnail, duration, tags, embed_code]
      );
      res.json({ message: 'Video metadata saved', video: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
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
const uploadVideoRouter = require('./uploadVideo');
app.use(uploadVideoRouter);


/* ============================================================
   Start the Server
   ============================================================ */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
