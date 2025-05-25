const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const corsMiddleware = require("./middleware/corsConfig");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const passwordRoutes = require("./routes/passwordRoutes");
const authRoutes     = require("./routes/authRoutes");

// ========== MIDDLEWARE ==========
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(corsMiddleware);

// ========== ROUTES ==========
const userRoutes = require("./routes/userRoutes");
const followRoutes = require("./routes/followRoutes");
const videoRoutes = require("./routes/videoRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const likeRoutes = require("./routes/likeRoutes");
const searchRoutes = require("./routes/searchRoutes");
app.use(passwordRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(followRoutes);
app.use(videoRoutes);
app.use(playlistRoutes);
app.use(likeRoutes);
app.use(searchRoutes);

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
