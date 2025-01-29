const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();

dotenv.config();

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// SQLite-database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    last_active TEXT NOT NULL,
    streak_count INTEGER DEFAULT 1
  )`);

  console.log("Tables ensured in SQLite database.");
});


app.use(cors());
app.use(bodyParser.json());

// **1. Registrering av bruker**
app.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
      [email, hashedPassword, username],
      function (err) {
        if (err) {
          return res.status(400).send({ error: 'User already exists' });
        }
        res.status(201).send({ message: 'User registered successfully', id: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).send({ error: 'Error registering user' });
  }
});

// **2. Innlogging av bruker**
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).send({ token, username: user.username });
  });
});

// **3. Oppdater streak**
app.post('/streak', (req, res) => {
  const { userId } = req.body;
  const today = new Date().toISOString().split('T')[0];

  db.get('SELECT * FROM streaks WHERE user_id = ?', [userId], (err, streak) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (streak) {
      const lastActive = new Date(streak.last_active);
      const diffDays = Math.floor((new Date(today) - lastActive) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        db.run(
          'UPDATE streaks SET streak_count = streak_count + 1, last_active = ? WHERE user_id = ?',
          [today, userId],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ error: updateErr.message });
            }
            res.json({ message: 'Streak updated!', streakCount: streak.streak_count + 1 });
          }
        );
      } else if (diffDays > 1) {
        db.run(
          'UPDATE streaks SET streak_count = 1, last_active = ? WHERE user_id = ?',
          [today, userId],
          (resetErr) => {
            if (resetErr) {
              return res.status(500).json({ error: resetErr.message });
            }
            res.json({ message: 'Streak reset!', streakCount: 1 });
          }
        );
      } else {
        res.json({ message: 'No change', streakCount: streak.streak_count });
      }
    } else {
      db.run(
        'INSERT INTO streaks (user_id, last_active, streak_count) VALUES (?, ?, 1)',
        [userId, today],
        (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ error: insertErr.message });
          }
          res.json({ message: 'Streak started!', streakCount: 1 });
        }
      );
    }
  });
});

// **4. Opprett spilleliste**
app.post('/api/playlists', (req, res) => {
  const { userId, name } = req.body;

  db.run('INSERT INTO playlists (user_id, name) VALUES (?, ?)', [userId, name], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Playlist created!', playlistId: this.lastID });
  });
});

// **5. Legg til video i spilleliste**
app.post('/api/playlists/:playlistId/videos', (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  db.run(
    'INSERT INTO playlist_videos (playlist_id, video_id) VALUES (?, ?)',
    [playlistId, videoId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Video added to playlist!' });
    }
  );
});

app.get('/api/playlists', (req, res) => {
  const { userId } = req.query;

  db.all('SELECT * FROM playlists WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// **6. Uforutsigbar belønning**
app.post('/api/rewards', (req, res) => {
  const { userId, watchedVideos } = req.body;

  if (watchedVideos % 10 === 0) {
    db.run(
      'INSERT INTO rewards (user_id, reward_type) VALUES (?, ?)',
      [userId, 'Premium Video'],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Congratulations! You won a Premium Video!' });
      }
    );
  } else {
    res.json({ message: 'Keep watching for a chance to win!' });
  }
});

// Start serveren
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
