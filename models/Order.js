// models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  price: Number,
  qty: Number,
  image: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [orderItemSchema],
  total: Number,
  status: { type: String, default: "placed" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
