const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ✅ Check for token in cookies (optional)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // ❌ No token provided
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch user (ensure still exists)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found or removed" });
    }

    req.user = user; // attach to request for use in routes
    next();
  } catch (err) {
    console.error("❌ Auth Middleware Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
