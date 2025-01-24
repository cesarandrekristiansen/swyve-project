const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

function addUser(username, email, password) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, password],
      function (err) {
        if (err) {
          reject(err.message);
        } else {
          resolve(`User added with ID: ${this.lastID}`);
        }
      }
    );
  });
}

module.exports = { addUser };
