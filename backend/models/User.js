const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
      minlength: 6,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

      role: {
    type: String,
    enum: ["customer", "restaurant", "rider", "admin"],
    default: "customer",
  },

    restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    default: null,
  },

    // =========================
    // SOCIAL AUTH
    // =========================

    authProvider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    appleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // =========================
    // PASSWORD RESET
    // =========================


        emailVerified: {
      type: Boolean,
      default: false,
    },

          emailVerificationCode: {
        type: String,
        default: "",
      },

      emailVerificationExpires: {
        type: Date,
        default: null,
      },

      emailVerificationAttempts: {
        type: Number,
        default: 0,
      },


    resetPasswordToken: {
      type: String,
      default: "",
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);