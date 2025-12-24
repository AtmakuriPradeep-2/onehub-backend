const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Fetch all vendors
router.get("/vendors", async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" });
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Error fetching vendors" });
  }
});

// Approve a vendor
router.put("/vendors/approve/:id", async (req, res) => {
  try {
    const vendor = await User.findByIdAndUpdate(
      req.params.id,
      { isVendorApproved: true },
      { new: true }
    );
    res.status(200).json({ message: "Vendor approved successfully", vendor });
  } catch (error) {
    console.error("Error approving vendor:", error);
    res.status(500).json({ message: "Error approving vendor" });
  }
});

module.exports = router;
