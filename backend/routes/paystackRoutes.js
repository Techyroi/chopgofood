const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Initialize Paystack Transaction
|--------------------------------------------------------------------------
| POST /api/paystack/initialize
*/
router.post("/initialize", authMiddleware, async (req, res) => {
  try {
    const {
      email,
      amount,
      reference,
    } = req.body;

    if (!email || !amount || !reference) {
      return res.status(400).json({
        success: false,
        message: "Email, amount and reference are required",
      });
    }

    const order = await Order.findOne({
      paystackReference: reference,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    const expectedAmount = Math.round(order.total * 100);

    if (Math.round(Number(amount) * 100) !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match the order total",
      });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: expectedAmount,
        currency: "NGN",
        reference,
        callback_url: "http://localhost:5173/checkout",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        adapter: "http",
      }
    );

    const paystackData = response.data.data;

    return res.status(200).json({
      success: true,
      message: "Paystack transaction initialized successfully",
      data: {
        authorization_url: paystackData.authorization_url,
        access_code: paystackData.access_code,
        reference: paystackData.reference,
      },
    });
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to initialize Paystack transaction",
      error:
        error.response?.data?.message ||
        error.message,
    });
  }
});


/*
|--------------------------------------------------------------------------
| Paystack Webhook
|--------------------------------------------------------------------------
| POST /api/paystack/webhook
*/
router.post("/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    if (!signature) {
      return res.status(401).json({
        success: false,
        message: "Missing Paystack signature",
      });
    }

    if (!req.rawBody) {
      return res.status(400).json({
        success: false,
        message: "Raw webhook body is missing",
      });
    }

    const hash = crypto
      .createHmac(
        "sha512",
        process.env.PAYSTACK_SECRET_KEY
      )
      .update(req.rawBody)
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).json({
        success: false,
        message: "Invalid Paystack signature",
      });
    }

    const event = req.body;

    if (event.event !== "charge.success") {
      return res.status(200).json({
        success: true,
        message: "Event received",
      });
    }

    const transaction = event.data;

    const order = await Order.findOne({
      paystackReference: transaction.reference,
    });

    if (!order) {
      console.error(
        "Paystack webhook: order not found:",
        transaction.reference
      );

      return res.status(200).json({
        success: true,
        message: "Event received",
      });
    }

    const expectedAmount = Math.round(
      order.total * 100
    );

    if (
      transaction.status !== "success" ||
      transaction.amount !== expectedAmount ||
      transaction.currency !== "NGN" ||
      transaction.reference !== order.paystackReference
    ) {
      console.error(
        "Paystack webhook: payment validation failed",
        {
          reference: transaction.reference,
          transactionStatus: transaction.status,
          transactionAmount: transaction.amount,
          expectedAmount,
          currency: transaction.currency,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Event received",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    await order.save();

    console.log(
      "Paystack webhook: payment confirmed",
      order._id
    );

    return res.status(200).json({
      success: true,
      message: "Payment confirmed",
    });
  } catch (error) {
    console.error(
      "Paystack webhook error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
});


/*
|--------------------------------------------------------------------------
| Verify Paystack Transaction
|--------------------------------------------------------------------------
| GET /api/paystack/verify/:reference
|--------------------------------------------------------------------------
*/
router.get(
  "/verify/:reference",
  authMiddleware,
  async (req, res) => {
    try {
      const { reference } = req.params;

      const order = await Order.findOne({
        paystackReference: reference,
        user: req.userId,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (order.paymentStatus === "paid") {
        return res.status(200).json({
          success: true,
          message: "Payment was already verified",
          data: {
            status: "success",
            orderId: order._id,
            reference: order.paystackReference,
            amount: Math.round(order.total * 100),
          },
        });
      }

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const transaction = response.data.data;

      const expectedAmount =
        Math.round(order.total * 100);

      const paymentIsValid =
        transaction.status === "success" &&
        transaction.amount === expectedAmount &&
        transaction.currency === "NGN" &&
        transaction.reference ===
          order.paystackReference;

      if (!paymentIsValid) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
          data: {
            status: transaction.status,
            orderId: order._id,
            reference: transaction.reference,
            amount: transaction.amount,
            currency: transaction.currency,
          },
        });
      }

      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          status: "success",
          orderId: order._id,
          reference: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
          channel: transaction.channel,
        },
      });
    } catch (error) {
      console.error(
        "Paystack verification error:",
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        message: "Failed to verify Paystack transaction",
      });
    }
  }
);


module.exports = router;