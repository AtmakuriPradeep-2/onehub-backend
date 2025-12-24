// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth"); // must export protect
const { createOrder, getMyOrders, getOrderById } = require("../controllers/orderController");

console.log("✅ orderRoutes.js LOADED");

// diagnostic test route — visit http://localhost:5000/api/orders/test
router.get("/test", (req, res) => res.json({ ok: true, message: "orderRoutes test ok" }));

// real routes
router.post("/create", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

module.exports = router;
