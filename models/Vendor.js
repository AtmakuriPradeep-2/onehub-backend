const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','vendor','customer','delivery'], default: 'customer' },
  phone: String,
  address: String,
  isVendorApproved: { type: Boolean, default: false }
}, { timestamps: true });

// ✅ prevent overwrite error
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
