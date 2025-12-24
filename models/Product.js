const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: String,
  image: String,
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ✅ Change this from "Vendor" to "User" if vendors are stored in User model
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
