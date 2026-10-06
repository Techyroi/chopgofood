const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const User = require("../models/User");
const Order = require("../models/Order");

// ------------------------------------------------------------
// GET ASSIGNED DELIVERIES
// GET /api/rider-dashboard/deliveries
// ------------------------------------------------------------

router.get(
  "/deliveries",
  authMiddleware,
  roleMiddleware("rider"),
  async (req, res) => {
    try {
          const orders = await Order.find({
        rider: req.userId,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate(
          "restaurant",
          "name logo coverImage address phone"
        )
        .populate(
          "user",
          "fullName email phone"
        )
        
         .lean();

      res.json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error("Rider deliveries error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load rider deliveries",
      });
    }
  }
);

// ------------------------------------------------------------
// UPDATE DELIVERY STATUS
// PUT /api/rider-dashboard/deliveries/:id/status
// ------------------------------------------------------------

router.put(
  "/deliveries/:id/status",
  authMiddleware,
  roleMiddleware("rider"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "out_for_delivery",
        "delivered",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rider delivery status",
        });
      }

      const order = await Order.findOne({
        _id: req.params.id,
        rider: req.userId,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery not found or not assigned to this rider",
        });
      }

      if (status === "out_for_delivery") {
        if (order.orderStatus !== "ready") {
          return res.status(400).json({
            success: false,
            message:
              "Only orders that are ready can be taken out for delivery",
          });
        }
      }

      if (status === "delivered") {
        if (order.orderStatus !== "out_for_delivery") {
          return res.status(400).json({
            success: false,
            message:
              "Only orders that are out for delivery can be marked as delivered",
          });
        }
      }

      order.orderStatus = status;

      await order.save();

      res.json({
        success: true,
        message: "Delivery status updated successfully",
        data: order,
      });
    } catch (error) {
      console.error(
        "Update rider delivery status error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to update delivery status",
      });
    }
  }
);

module.exports = router;