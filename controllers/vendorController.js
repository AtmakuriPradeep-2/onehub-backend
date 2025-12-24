const User = require('../models/User');
const Vendor = require('../models/Vendor');

// --- Vendor applies for vendor role ---
exports.applyVendor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'vendor';
    user.isVendorApproved = false;
    user.firmName = req.body.firmName || 'Unnamed Firm';
    await user.save();

    res.status(200).json({ message: 'Vendor application submitted successfully.' });
  } catch (error) {
    console.error('Error applying as vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Admin: Get all vendor applications ---
exports.getAllApplications = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' });
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor applications', error });
  }
};

// --- Admin: Approve a vendor ---
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    vendor.isVendorApproved = true;
    await vendor.save();

    res.status(200).json({ message: 'Vendor approved successfully' });
  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({ message: 'Error approving vendor' });
  }
};

// --- Vendor: Get vendor profile ---
exports.getVendorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || user.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({
      vendor: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVendorApproved: user.isVendorApproved,
        firmName: user.firmName,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
