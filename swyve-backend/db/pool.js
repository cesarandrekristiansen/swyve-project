const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false, // Add this
  },
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Postgres connection error:", err);
  } else {
    console.log("Postgres connected:", res.rows);
  }
});

module.exports = pool;
