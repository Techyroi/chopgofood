const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const User = require("../models/User");
const Order = require("../models/Order");
const MenuItem = require("../models/menuItem");
const Restaurant = require("../models/Restaurant");


// =========================
// RESTAURANT ORDERS
// =========================

router.get(
  "/orders",
  authMiddleware,
  roleMiddleware("restaurant"),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("restaurant");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Restaurant user not found",
        });
      }

      if (!user.restaurant) {
        return res.status(400).json({
          success: false,
          message:
            "This restaurant account is not linked to a restaurant",
        });
      }

      const orders = await Order.find({
        restaurant: user.restaurant,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("user", "fullName email phone")
        .populate("restaurant", "name logo coverImage address")
        .lean();

            const restaurantOrders = orders.map((order) => {
              const orderData = order;

                            const {
                deliveryFee,
                deliveryDistanceKm,
                total,
                checkoutId,
                paystackReference,
                deliveryLocation,
                deliveryAddress,
                ...restaurantOrderData
                } = orderData;

                return restaurantOrderData;
                });

                res.json({
                success: true,
                count: restaurantOrders.length,
                data: restaurantOrders,
                });
    } catch (error) {
      console.error("Restaurant orders error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load restaurant orders",
      });
    }
  }
);

// GET MENU ITEMS FOR RESTAURANT
router.get(
  "/menu",
  authMiddleware,
  roleMiddleware("restaurant"),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      if (!user || !user.restaurant) {
        return res.status(400).json({
          success: false,
          message: "Restaurant account is not linked to a restaurant",
        });
      }

      const menuItems = await MenuItem.find({
        restaurant: user.restaurant,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("restaurant", "name logo")
        .lean();

      res.json({
        success: true,
        count: menuItems.length,
        data: menuItems,
      });
    } catch (error) {
      console.error("Restaurant menu error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load restaurant menu",
      });
    }
  }
);

// =========================
// UPDATE RESTAURANT ORDER STATUS
// =========================

router.put(
  "/orders/:id/status",
  authMiddleware,
  roleMiddleware("restaurant"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const user = await User.findById(req.userId).select("restaurant");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Restaurant user not found",
        });
      }

      if (!user.restaurant) {
        return res.status(400).json({
          success: false,
          message:
            "This restaurant account is not linked to a restaurant",
        });
      }

      const order = await Order.findOne({
        _id: req.params.id,
        restaurant: user.restaurant,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found for this restaurant",
        });
      }

      order.orderStatus = status;

      await order.save();

      const updatedOrder = await Order.findById(order._id)
        .populate("user", "fullName email phone")
        .populate(
          "restaurant",
          "name logo coverImage address phone"
        );

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.error(
        "Restaurant order status update error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  }
);

// CREATE MENU ITEM FOR RESTAURANT
router.post(
  "/menu",
  authMiddleware,
  roleMiddleware("restaurant"),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      if (!user || !user.restaurant) {
        return res.status(400).json({
          success: false,
          message: "Restaurant account is not linked to a restaurant",
        });
      }

      const {
        name,
        description,
        image,
        price,
        category,
        isAvailable,
        isPopular,
        preparationTime,
      } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({
          success: false,
          message: "Name and price are required",
        });
      }

      const menuItem = new MenuItem({
        restaurant: user.restaurant,
        name,
        description,
        image,
        price,
        category,
        isAvailable,
        isPopular,
        preparationTime,
      });

      await menuItem.save();

      await menuItem.populate("restaurant", "name logo");

      res.status(201).json({
        success: true,
        message: "Menu item created successfully",
        data: menuItem,
      });
    } catch (error) {
      console.error("Create restaurant menu item error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create menu item",
      });
    }
  }
);

// UPDATE MENU ITEM FOR RESTAURANT
router.put(
  "/menu/:id",
  authMiddleware,
  roleMiddleware("restaurant"),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("restaurant");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Restaurant user not found",
        });
      }

      if (!user.restaurant) {
        return res.status(400).json({
          success: false,
          message:
            "This restaurant account is not linked to a restaurant",
        });
      }

      const {
        name,
        description,
        image,
        price,
        category,
        isAvailable,
        isPopular,
        preparationTime,
      } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({
          success: false,
          message: "Name and price are required",
        });
      }

      const menuItem = await MenuItem.findOne({
        _id: req.params.id,
        restaurant: user.restaurant,
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found for this restaurant",
        });
      }

      menuItem.name = name;
      menuItem.description = description;
      menuItem.image = image;
      menuItem.price = price;
      menuItem.category = category;
      menuItem.isAvailable = isAvailable;
      menuItem.isPopular = isPopular;
      menuItem.preparationTime = preparationTime;

      await menuItem.save();

      await menuItem.populate("restaurant", "name logo");

      res.json({
        success: true,
        message: "Menu item updated successfully",
        data: menuItem,
      });
    } catch (error) {
      console.error("Update restaurant menu item error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update menu item",
      });
    }
  }
);

// GET RESTAURANT PROFILE
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("restaurant"),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("restaurant");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Restaurant user not found",
        });
      }

      if (!user.restaurant) {
        return res.status(400).json({
          success: false,
          message:
            "This restaurant account is not linked to a restaurant",
        });
      }

      const restaurant = await require("../models/Restaurant").findById(
        user.restaurant
      );

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      res.json({
        success: true,
        data: restaurant,
      });
    } catch (error) {
      console.error("Get restaurant profile error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load restaurant profile",
      });
    }
  }
);

// UPDATE RESTAURANT PROFILE
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("restaurant"),
  async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("restaurant");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Restaurant user not found",
        });
      }

      if (!user.restaurant) {
        return res.status(400).json({
          success: false,
          message:
            "This restaurant account is not linked to a restaurant",
        });
      }

      const {
        name,
        description,
        cuisine,
        address,
        phone,
        logo,
        coverImage,
        deliveryFee,
        estimatedDeliveryTimeMin,
        estimatedDeliveryTimeMax,
        isOpen,
      } = req.body;

      if (!name || !address) {
        return res.status(400).json({
          success: false,
          message: "Restaurant name and address are required",
        });
      }

      const restaurant =
        await Restaurant.findById(user.restaurant);

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      restaurant.name = name.trim();
      restaurant.description = description;
      restaurant.cuisine = cuisine;
      restaurant.address = address.trim();
      restaurant.phone = phone;
      restaurant.logo = logo;
      restaurant.coverImage = coverImage;
      restaurant.deliveryFee = deliveryFee;
      restaurant.estimatedDeliveryTimeMin =
        estimatedDeliveryTimeMin;
      restaurant.estimatedDeliveryTimeMax =
        estimatedDeliveryTimeMax;
      restaurant.isOpen = isOpen;

      await restaurant.save();

      res.json({
        success: true,
        message: "Restaurant profile updated successfully",
        data: restaurant,
      });
    } catch (error) {
      console.error("Update restaurant profile error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update restaurant profile",
      });
    }
  }
);

module.exports = router;