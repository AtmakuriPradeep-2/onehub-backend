const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const verifyToken = require("../middleware/verifyToken");

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only jpeg, jpg, png, webp allowed"));
  },
});

/* ✅ 1. PUBLIC — Get All Products for Customers */
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find().populate("vendor", "name email role isVendorApproved");
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("❌ Error fetching all products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

/* ✅ 2. Add Product (Vendor Only) */
router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const product = new Product({
      name,
      price,
      description,
      category,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      vendor: req.user.id,
    });
    await product.save();
    res.json({ message: "✅ Product added successfully!", product });
  } catch (error) {
    res.status(500).json({ message: "Server error adding product" });
  }
});

/* ✅ 3. Vendor — Get All Products of Logged-In Vendor */
router.get("/vendor", verifyToken, async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user.id });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

/* ✅ 4. Vendor — Get Single Product by ID */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

/* ✅ 5. Update Product */
router.put("/update/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update" });
    }
    if (req.file && product.image) {
      const oldImage = path.join(__dirname, "..", product.image.replace(/^\//, ""));
      if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
    }
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.image = req.file ? `/uploads/${req.file.filename}` : product.image;
    await product.save();
    res.json({ message: "✅ Product updated successfully!", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
});

/* ✅ 6. Delete Product */
// ✅ Correct Route for DELETE (Matches frontend)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Only the owner/vendor of the product can delete
    if (product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    // ✅ Delete image file if exists
    if (product.image) {
      const imgPath = path.join(__dirname, "..", product.image.replace(/^\//, ""));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // ✅ Remove product from database
    await Product.findByIdAndDelete(req.params.id);

    return res.json({ message: "🗑️ Product deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});


module.exports = router;
