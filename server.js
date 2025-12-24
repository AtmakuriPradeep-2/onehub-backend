require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ Allow all origins (Web + Mobile)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ✅ Serve uploads publicly
app.use("/uploads", express.static("uploads"));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ OneHub Backend is running successfully...");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vendors", require("./routes/vendorRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
