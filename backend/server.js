const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paystackRoutes = require("./routes/paystackRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const restaurantDashboardRoutes = require("./routes/restaurantDashboardRoutes");
const riderDashboardRoutes = require("./routes/riderDashboardRoutes");

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration =
      Number(process.hrtime.bigint() - start) / 1e6;

    console.log(
      `${req.method} ${req.originalUrl} - ${duration.toFixed(0)}ms`
    );
  });

  next();
});


// Middleware
app.use(
  cors({
    origin: [
      "https://chopgofood-frontendapp-3b8ghqha4-techyroi-s-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl === "/api/paystack/webhook") {
        req.rawBody = buf;
      }
    },
  })
);

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/paystack", paystackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/restaurant-dashboard", restaurantDashboardRoutes);
app.use(
  "/api/rider-dashboard",
  riderDashboardRoutes
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ChopGoFood API is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});