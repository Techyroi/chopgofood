const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    cuisine: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
},

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    estimatedDeliveryTimeMin: {
        type: Number,
        default: 20,
         min: 1,
    },


    estimatedDeliveryTimeMax: {
         type: Number,
         default: 40,
         min: 1,
    },

    badge: {
     type: String,
     enum: ["none", "topRated", "promo"],
     default: "none",
    },


    deliveryMessage: {
     type: String,
     default: "",
    trim: true,
    },
    

    deliveryType: {
     type: String,
     enum: ["fee", "free", "fastest"],
     default: "fee",
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

restaurantSchema.index({
  isActive: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Restaurant", restaurantSchema);