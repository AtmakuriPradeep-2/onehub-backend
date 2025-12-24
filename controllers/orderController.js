// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No cart items provided" });
    }

    const ids = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids } }).lean();

    if (products.length !== items.length) {
      return res.status(400).json({ message: "Some product(s) not found" });
    }

    let total = 0;
    const orderItems = items.map(it => {
      const p = products.find(x => x._id.toString() === it.productId);
      if (!p) throw new Error(`Product ${it.productId} not found`);
      total += p.price * it.qty;
      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        qty: it.qty,
        image: p.image || "",
      };
    });

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total,
    });

    // OPTIONAL: reduce stock (best-effort). If you need transactional safety, use sessions.
    try {
      const bulk = orderItems.map(it => ({
        updateOne: {
          filter: { _id: it.productId, stock: { $gte: it.qty } },
          update: { $inc: { stock: -it.qty } },
        },
      }));
      if (bulk.length) await Product.bulkWrite(bulk);
    } catch (e) {
      console.warn("Warning: stock update failed", e.message);
    }

    return res.status(201).json({ message: "Order placed", orderId: order._id });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ message: "Order creation failed", error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ message: "Could not fetch orders" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json({ order });
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).json({ message: "Could not fetch order" });
  }
};
