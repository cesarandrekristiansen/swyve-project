const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
