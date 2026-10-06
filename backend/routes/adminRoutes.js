const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const MenuItem = require("../models/menuItem");

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const [
        totalCustomers,
        totalRestaurants,
        totalOrders,
        revenueResult,
        pendingOrders,
        recentOrders,
      ] = await Promise.all([
        User.countDocuments({ role: "customer" }),

        Restaurant.countDocuments(),

        Order.countDocuments(),

        Order.aggregate([
          {
            $match: {
              paymentStatus: "paid",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total" },
            },
          },
        ]),

        Order.countDocuments({
          orderStatus: {
            $in: ["pending", "confirmed", "preparing"],
          },
        }),

        Order.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("user", "fullName email")
          .populate("restaurant", "name"),
      ]);

      const totalRevenue = revenueResult[0]?.total || 0;

      res.json({
        success: true,
        data: {
          totalCustomers,
          totalRestaurants,
          totalOrders,
          totalRevenue,
          pendingOrders,
          recentOrders,
        },
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load admin dashboard",
      });
    }
  }
);

router.get(
  "/orders",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("user", "fullName email phone")
        .populate("restaurant", "name logo coverImage address")
        .lean();

      res.json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error("Admin orders error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load admin orders",
      });
    }
  }
);

router.get(
  "/orders/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate("user", "fullName email phone address profileImage")
        .populate(
          "restaurant",
          "name logo coverImage address phone"
        )
        .populate(
          "items.menuItem",
          "name image category"
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Admin order details error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load order details",
      });
    }
  }
);

router.put(
  "/orders/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { orderStatus } = req.body;

      const allowedStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      order.orderStatus = orderStatus;

      await order.save();

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Admin order status update error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  }
);



router.get(
  "/restaurants",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

      res.json({
        success: true,
        count: restaurants.length,
        data: restaurants,
      });
    } catch (error) {
      console.error("Admin restaurants error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load admin restaurants",
      });
    }
  }
);

router.put(
  "/restaurants/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        logo,
        coverImage,
        cuisine,
        address,
        location,
        phone,
        rating,
        deliveryFee,
        estimatedDeliveryTimeMin,
        estimatedDeliveryTimeMax,
        badge,
        deliveryMessage,
        deliveryType,
        isOpen,
        isActive,
      } = req.body;

      const restaurant = await Restaurant.findById(
        req.params.id
      );

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      if (slug && slug !== restaurant.slug) {
        const existingRestaurant =
          await Restaurant.findOne({
            slug,
            _id: { $ne: req.params.id },
          });

        if (existingRestaurant) {
          return res.status(409).json({
            success: false,
            message:
              "Restaurant with this slug already exists",
          });
        }
      }


      restaurant.name = name;
      restaurant.slug = slug;
      restaurant.description = description;
      restaurant.logo = logo;
      restaurant.coverImage = coverImage;
      restaurant.cuisine = cuisine;
      restaurant.address = address;
      restaurant.location = location;
      restaurant.phone = phone;
      restaurant.rating = rating;
      restaurant.deliveryFee = deliveryFee;
      restaurant.estimatedDeliveryTimeMin =
        estimatedDeliveryTimeMin;
      restaurant.estimatedDeliveryTimeMax =
        estimatedDeliveryTimeMax;
      restaurant.badge = badge;
      restaurant.deliveryMessage =
        deliveryMessage;
      restaurant.deliveryType = deliveryType;
      restaurant.isOpen = isOpen;
      restaurant.isActive = isActive;

      await restaurant.save();

      res.json({
        success: true,
        message: "Restaurant updated successfully",
        data: restaurant,
      });
    } catch (error) {
      console.error(
        "Admin restaurant update error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to update restaurant",
      });
    }
  }
);

router.get(
  "/menu",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
    const menuItems = await MenuItem.find()
      .populate("restaurant", "name logo")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

      res.json({
        success: true,
        count: menuItems.length,
        data: menuItems,
      });
    } catch (error) {
      console.error(
        "Admin menu error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to load admin menu",
      });
    }
  }
);

router.get(
  "/customers",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
    const customers = await User.find({ role: "customer" })
      .select("fullName email phone address createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

      res.json({
        success: true,
        count: customers.length,
        data: customers,
      });
    } catch (error) {
      console.error(
        "Admin customers error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to load admin customers",
      });
    }
  }
);


// =========================
// ASSIGN RIDER TO ORDER
// =========================

router.put(
  "/orders/:id/rider",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { riderId } = req.body;

      if (!riderId) {
        return res.status(400).json({
          success: false,
          message: "Rider ID is required",
        });
      }

      const rider = await User.findOne({
        _id: riderId,
        role: "rider",
      });

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (
        !["ready", "out_for_delivery"].includes(
          order.orderStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A rider can only be assigned to an order that is ready or out for delivery",
        });
      }

      order.rider = rider._id;

      await order.save();

      const updatedOrder = await Order.findById(order._id)
        .populate(
          "rider",
          "fullName email phone address profileImage"
        )
        .populate(
          "user",
          "fullName email phone address profileImage"
        )
        .populate(
          "restaurant",
          "name logo coverImage address phone"
        );

      return res.json({
        success: true,
        message: "Rider assigned successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Assign rider error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to assign rider",
      });
    }
  }
);


// =========================
// CREATE RIDER
// =========================

router.post(
  "/riders",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { fullName, phone, email, password, address } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Full name, email and password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        $or: [
          { email: normalizedEmail },
          ...(phone ? [{ phone: phone.trim() }] : []),
        ],
      });

      if (existingUser) {
        if (existingUser.email === normalizedEmail) {
          return res.status(400).json({
            success: false,
            message: "An account with this email already exists",
          });
        }

        return res.status(400).json({
          success: false,
          message: "An account with this phone number already exists",
        });
      }

      const bcrypt = require("bcryptjs");

      const hashedPassword = await bcrypt.hash(password, 10);

      const rider = await User.create({
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : "",
        email: normalizedEmail,
        password: hashedPassword,
        address: address ? address.trim() : "",
        role: "rider",
        emailVerified: true,
      });

      return res.status(201).json({
        success: true,
        message: "Rider account created successfully",
        data: {
          _id: rider._id,
          fullName: rider.fullName,
          phone: rider.phone,
          email: rider.email,
          address: rider.address,
          role: rider.role,
          emailVerified: rider.emailVerified,
          createdAt: rider.createdAt,
        },
      });
    } catch (error) {
      console.error("Create rider error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create rider account",
      });
    }
  }
);

router.get(
  "/riders",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const riders = await User.find({ role: "rider" })
        .select("fullName email phone createdAt")
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        success: true,
        count: riders.length,
        data: riders,
      });
    } catch (error) {
      console.error(
        "Admin riders error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to load riders",
      });
    }
  }
);

router.get(
  "/payments",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const payments = await Order.find()
        .select(
          "user restaurant total paymentMethod paymentStatus checkoutId paystackReference createdAt"
        )
        .populate("user", "fullName email")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      res.json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (error) {
      console.error("Admin payments error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load payments",
      });
    }
  }
);

module.exports = router;