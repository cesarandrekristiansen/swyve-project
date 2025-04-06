const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token; // The name "token" matches the cookie name we set
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user data to request
    req.userId = decoded.id;
    // you can attach other fields if your token includes them
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
