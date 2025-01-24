const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

// Legg til en ny bruker
const username = 'testuser';
const email = 'testuser@example.com';
const password = 'password123';

db.run(
  `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
  [username, email, password],
  function (err) {
    if (err) {
      console.error('Error inserting data:', err.message);
    } else {
      console.log(`User added with ID: ${this.lastID}`);
    }
  }
);

db.close();
