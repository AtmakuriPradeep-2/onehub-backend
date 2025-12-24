const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// ====================== REGISTER ======================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Validate role
    const allowedRoles = ["admin", "vendor", "customer", "delivery"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vendor requires admin approval
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: role.toLowerCase(),
      isVendorApproved: role.toLowerCase() === "vendor" ? false : true,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Registration successful! Please login.",
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ====================== LOGIN ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Check if vendor is approved
    if (user.role === "vendor" && !user.isVendorApproved) {
      return res.status(403).json({
        message: "Your vendor account is awaiting admin approval. Please try later.",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVendorApproved: user.isVendorApproved,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ====================== GET CURRENT USER ======================
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("❌ Fetch Current User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
