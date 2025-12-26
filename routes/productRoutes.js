const express = require("express");
const router = express.Router();

const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// ================= PRODUCT ROUTES =================

// 🔹 GET ALL PRODUCTS (CUSTOMER)
router.get("/all", getAllProducts);

// 🔹 ADD PRODUCT (VENDOR)
router.post("/", addProduct);

// 🔹 GET SINGLE PRODUCT BY ID
router.get("/:id", getProductById);

// 🔹 UPDATE PRODUCT
router.put("/:id", updateProduct);

// 🔹 DELETE PRODUCT
router.delete("/:id", deleteProduct);

// ✅ EXPORT ROUTER
module.exports = router;
