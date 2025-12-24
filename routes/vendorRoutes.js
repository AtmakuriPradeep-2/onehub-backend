const express = require('express');
const router = express.Router();
const {
  applyVendor,
  getAllApplications,
  approveVendor,
  getVendorProfile,
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const User = require('../models/User');

// --- Vendor applies for vendor role ---
router.post('/apply', protect, applyVendor);

// --- Admin: Get all vendor applications ---
router.get('/applications', protect, authorize('admin'), getAllApplications);

// --- Admin: Get all pending vendor approvals ---
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', isVendorApproved: false })
      .select('name email firmName createdAt');
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching pending vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors', error: error.message });
  }
});

// --- Admin: Approve vendor ---
router.put('/approve/:id', protect, authorize('admin'), approveVendor);

// --- Vendor: Get own vendor profile (for dashboard check) ---
router.get('/profile', protect, authorize('vendor'), getVendorProfile);

module.exports = router;
