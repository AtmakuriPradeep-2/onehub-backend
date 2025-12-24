const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // ✅ Check token in Cookie or Header
    const token =
      req.cookies?.token || // If sent via cookies
      (req.headers.authorization?.startsWith("Bearer ") &&
        req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // or req.vendor if specific
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
};
