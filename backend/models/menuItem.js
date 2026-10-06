const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isPopular: {
      type: Boolean,
      default: false,
    },

    preparationTime: {
      type: Number,
      default: 20,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({
  restaurant: 1,
  isAvailable: 1,
  createdAt: -1,
});

menuItemSchema.index({
  restaurant: 1,
  createdAt: -1,
});

menuItemSchema.index({
  isAvailable: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.MenuItem ||
  mongoose.model("MenuItem", menuItemSchema);