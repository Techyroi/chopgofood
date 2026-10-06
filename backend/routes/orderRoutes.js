const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/menuItem");
const { calculateDistanceKm } = require("../utils/distance");
const calculateDeliveryFee = require("../utils/deliveryFee");
console.log("calculateDistanceKm:", typeof calculateDistanceKm);

const authMiddleware = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| Delivery Quote
|--------------------------------------------------------------------------
| POST /api/orders/delivery-quote
|--------------------------------------------------------------------------
*/

router.post("/delivery-quote", async (req, res) => {
  try {
    const {
      restaurant,
      deliveryLocation,
      items,
    } = req.body;

    if (
      !restaurant ||
      !deliveryLocation ||
      deliveryLocation.latitude === undefined ||
      deliveryLocation.longitude === undefined ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant, delivery location and items are required",
      });
    }

    const restaurantData =
      await Restaurant.findById(restaurant);

    if (!restaurantData) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const {
      latitude: customerLatitude,
      longitude: customerLongitude,
    } = deliveryLocation;

    if (
      typeof customerLatitude !== "number" ||
      typeof customerLongitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid customer coordinates are required",
      });
    }

    const restaurantLatitude =
      restaurantData.location.latitude;

    const restaurantLongitude =
      restaurantData.location.longitude;

    const deliveryDistanceKm =
      calculateDistanceKm(
        restaurantLatitude,
        restaurantLongitude,
        customerLatitude,
        customerLongitude
      );

    if (!Number.isFinite(deliveryDistanceKm)) {
      return res.status(400).json({
        success: false,
        message:
          "Could not calculate delivery distance.",
      });
    }

    const menuItemIds = items.map(
      (item) => item.menuItem
    );

    const menuItems =
      await MenuItem.find({
        _id: { $in: menuItemIds },
        restaurant: restaurantData._id,
        isAvailable: true,
      });

    if (menuItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected menu items are unavailable or do not belong to this restaurant.",
      });
    }

    const orderItems = items.map((item) => {
      const menuItem = menuItems.find(
        (dbItem) =>
          dbItem._id.toString() ===
          item.menuItem.toString()
      );

      if (!menuItem) {
        throw new Error(
          "Menu item could not be found."
        );
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          "Invalid item quantity."
        );
      }

      const price = menuItem.price;

      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        image: menuItem.image,
        price,
        quantity,
        subtotal: price * quantity,
      };
    });

    const subtotal = orderItems.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );

    const totalQuantity = orderItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

    const deliveryFee =
      calculateDeliveryFee(
        restaurantData.deliveryFee,
        deliveryDistanceKm,
        totalQuantity
      );

    const total = subtotal + deliveryFee;

    return res.status(200).json({
      success: true,
      data: {
        distanceKm: Number(
          deliveryDistanceKm.toFixed(2)
        ),
        deliveryFee,
        subtotal,
        total,
      },
    });
  } catch (error) {
    console.error(
      "Delivery quote error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to calculate delivery quote",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
| POST /api/orders
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      restaurant,
      items,
      deliveryAddress,
      deliveryLocation,
      phone,
      paymentMethod,
      checkoutId,
    } = req.body;

    if (!checkoutId) {
      return res.status(400).json({
        success: false,
        message: "Checkout ID is required",
      });
    }

    const existingOrder = await Order.findOne({
      checkoutId,
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Existing order found",
        data: existingOrder,
      });
    }

    if (
      !restaurant ||
      !items ||
      items.length === 0 ||
      !deliveryAddress ||
      !phone ||
      !deliveryLocation ||
      deliveryLocation.latitude === undefined ||
      deliveryLocation.longitude === undefined ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required order information",
      });
    }

    const restaurantData =
      await Restaurant.findById(restaurant);

    if (!restaurantData) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const {
      latitude: customerLatitude,
      longitude: customerLongitude,
    } = deliveryLocation;

    if (
      typeof customerLatitude !== "number" ||
      typeof customerLongitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid customer coordinates are required",
      });
    }

    const restaurantLatitude =
      restaurantData.location.latitude;

    const restaurantLongitude =
      restaurantData.location.longitude;

    console.log("DELIVERY LOCATION DEBUG");

    console.log(
      "Restaurant:",
      restaurantData.name
    );

    console.log(
      "Restaurant latitude:",
      restaurantLatitude
    );

    console.log(
      "Restaurant longitude:",
      restaurantLongitude
    );

    console.log(
      "Customer latitude:",
      customerLatitude
    );

    console.log(
      "Customer longitude:",
      customerLongitude
    );

    const deliveryDistanceKm =
      calculateDistanceKm(
        restaurantLatitude,
        restaurantLongitude,
        customerLatitude,
        customerLongitude
      );

    if (!Number.isFinite(deliveryDistanceKm)) {
      return res.status(400).json({
        success: false,
        message:
          "Could not calculate delivery distance. Please check the restaurant and delivery location coordinates.",
      });
    }

    const menuItemIds = items.map(
      (item) => item.menuItem
    );

    const menuItems =
      await MenuItem.find({
        _id: { $in: menuItemIds },
        restaurant: restaurantData._id,
        isAvailable: true,
      });

    if (menuItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected menu items are unavailable or do not belong to this restaurant.",
      });
    }

    const orderItems = items.map((item) => {
      const menuItem = menuItems.find(
        (dbItem) =>
          dbItem._id.toString() ===
          item.menuItem.toString()
      );

      if (!menuItem) {
        throw new Error(
          "Menu item could not be found."
        );
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          "Invalid item quantity."
        );
      }

      const price = menuItem.price;

      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        image: menuItem.image,
        price,
        quantity,
        subtotal: price * quantity,
      };
    });

    const subtotal = orderItems.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );

    const totalQuantity = orderItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

    const deliveryFee =
      calculateDeliveryFee(
        restaurantData.deliveryFee,
        deliveryDistanceKm,
        totalQuantity
      );

    const total = subtotal + deliveryFee;

    const order = await Order.create({
      user: req.userId,
      restaurant: restaurantData._id,
      items: orderItems,
      deliveryAddress,
      phone,
      deliveryLocation: {
        latitude: customerLatitude,
        longitude: customerLongitude,
      },
      deliveryDistanceKm,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      checkoutId,
    });

    const paystackReference =
      `order-${order._id}`;

    order.paystackReference =
      paystackReference;

    await order.save();

    console.log("ORDER CREATED");

    console.log(
      "Order ID:",
      order._id
    );

    console.log(
      "Distance:",
      deliveryDistanceKm.toFixed(2),
      "km"
    );

    console.log(
      "Delivery Fee:",
      deliveryFee
    );

    console.log(
      "Paystack Reference:",
      paystackReference
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        ...order.toObject(),
        calculatedDeliveryFee:
          deliveryFee,
        calculatedDistanceKm:
          Number(
            deliveryDistanceKm.toFixed(2)
          ),
      },
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
| PATCH /api/orders/:id/cancel
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/cancel",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      const order = await Order.findOne({
        _id: id,
        user: req.userId,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const cancellableStatuses = [
        "pending",
        "confirmed",
      ];

      if (
        !cancellableStatuses.includes(
          order.orderStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order can no longer be cancelled.",
        });
      }

      order.orderStatus = "cancelled";

      await order.save();

      return res.status(200).json({
        success: true,
        message:
          "Order cancelled successfully",
        data: order,
      });
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to cancel order",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get Orders
|--------------------------------------------------------------------------
| GET /api/orders
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("restaurant", "name logo coverImage address")
        .lean();

            return res.status(200).json({
              success: true,
              count: orders.length,
              data: orders,
            });
          } catch (error) {
            console.error(
              "Get orders error:",
              error
            );

      return res.status(500).json({
        success: false,
        message: "Failed to get orders",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get Order By ID
|--------------------------------------------------------------------------
| GET /api/orders/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      const order = await Order.findOne({
        _id: id,
        user: req.userId,
      })
        .populate(
          "restaurant",
          "name logo coverImage address"
        )
        .populate(
          "items.menuItem",
          "name image"
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error(
        "Get order error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get order",
        error: error.message,
      });
    }
  }
);

module.exports = router;