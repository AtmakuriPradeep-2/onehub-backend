const Product = require("../models/Product");

// ✅ Add Product
exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      image,
      vendor: req.user._id, // from verifyToken middleware
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", newProduct });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Server error adding product" });
  }
};

// ✅ Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendor", "firmName isApproved");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single product by ID (for update page)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Get Product Error:", err);
    res.status(500).json({ message: "Error fetching product" });
  }
};

// ✅ Update product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    // Prepare update fields
    const updateData = { name, price, description, category };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated successfully", updatedProduct });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ message: "Server error updating product" });
  }
};

// ✅ Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ message: "Server error deleting product" });
  }
};
