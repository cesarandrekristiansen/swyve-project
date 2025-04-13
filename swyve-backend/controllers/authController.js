const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, username } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id",
      [email, hashedPassword, username]
    );
    res
      .status(201)
      .send({ message: "User registered successfully", id: result.rows[0].id });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).send({ error: "User already exists" });
    }
    res.status(500).send({ error: "Error registering user" });
  }
};

exports.login = async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user) return res.status(404).send({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      })
      .status(200)
      .json({ username: user.username, userId: user.id });
  } catch (error) {
    console.error("Error in login route:", error);
    res.status(500).send({ error: "Error logging in" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out" });
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      "SELECT id, email FROM users WHERE id = $1",
      [userId]
    );
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
