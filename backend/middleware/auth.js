// middleware/auth.js
// Verify JWT from Authorization: Bearer  header
// Attach decoded user id to req.user
// Call next() if valid, return 401 if missing or invalid

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer")) {
    res.status(401);
    return next(new Error("Not authorized, no token"));
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401);
    return next(new Error("Not authorized, token failed"));
  }
};

module.exports = { protect };
