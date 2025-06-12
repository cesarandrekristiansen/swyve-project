const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const corsMiddleware = require("./middleware/corsConfig");
const path = require("path");
const next = require("next");

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev, dir: path.join(__dirname, "next-blog") });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  const PORT = process.env.PORT || 5001;
// må være i denne rekkefølgen
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(corsMiddleware);

  const passwordRoutes = require("./routes/passwordRoutes");
app.use(passwordRoutes);
// ========== MIDDLEWARE ==========
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});
// ========== next.js  ==========
  app.all("/_next/*", (req, res) => {
    return handle(req, res);
  });
  app.get("/:file((?:.+)\\.(png|jpg|jpeg|gif|svg|ico|webp))", (req, res) => {
    return handle(req, res);
  });
  app.get("/blog",       (req, res) => handle(req, res));
  app.get("/blog/:slug", (req, res) => handle(req, res));

// ========== ROUTES ==========
  const authRoutes = require("./routes/authRoutes");
  const userRoutes = require("./routes/userRoutes");
  const followRoutes = require("./routes/followRoutes");
  const videoRoutes = require("./routes/videoRoutes");
  const playlistRoutes = require("./routes/playlistRoutes");
  const likeRoutes = require("./routes/likeRoutes");
  const searchRoutes = require("./routes/searchRoutes");
  const blogRoutes = require("./routes/blogRoutes");
  const commentRoutes = require("./routes/commentRoutes");
  const applicationRoutes = require("./routes/applicationRoutes");

  app.use(authRoutes);
  app.use(userRoutes);
  app.use(followRoutes);
  app.use(videoRoutes);
  app.use(playlistRoutes);
  app.use(likeRoutes);
  app.use(searchRoutes);
  app.use(blogRoutes);
  app.use(commentRoutes);
  app.use(applicationRoutes);

  app.use((req, res) => {
    res.status(404).send("Not found");
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
