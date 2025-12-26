const Product = require("../models/Product");

/* =====================================
   ADD PRODUCT (VENDOR)
===================================== */
exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      image: req.file.path, // ✅ Cloudinary URL
      vendor: req.user._id, // from verifyToken middleware
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Add Product Error:", error);
    res.status(500).json({ message: "Server error adding product" });
  }
};

/* =====================================
   GET ALL PRODUCTS (CUSTOMER)
===================================== */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate(
      "vendor",
      "firmName isApproved"
    );
    res.json({ products });
  } catch (err) {
    console.error("❌ Get All Products Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =====================================
   GET SINGLE PRODUCT BY ID
===================================== */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("❌ Get Product Error:", err);
    res.status(500).json({ message: "Error fetching product" });
  }
};

/* =====================================
   UPDATE PRODUCT
===================================== */
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    const updateData = {
      name,
      price,
      description,
      category,
    };

    // ✅ If new image uploaded → Cloudinary URL
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("❌ Update Product Error:", err);
    res.status(500).json({ message: "Server error updating product" });
  }
};

/* =====================================
   DELETE PRODUCT
===================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Product Error:", err);
    res.status(500).json({ message: "Server error deleting product" });
  }
};
module.exports = router;