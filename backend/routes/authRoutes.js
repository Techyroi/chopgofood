const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const {
  sendPasswordResetEmail,
  sendEmailVerificationCode,
} = require("../services/emailService");

const router = express.Router();


// =========================
// SIGN UP
// =========================
router.post("/signup", async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
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
          message: "An account with this email already exists.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "An account with this phone number already exists.",
      });
    }

    // Generate a secure 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 1000000).toString();

    // Store only a hash of the verification code
    const verificationCodeHash = crypto
      .createHash("sha256")
      .update(verificationCode)
      .digest("hex");

    const verificationExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : "",
      email: normalizedEmail,
      password: hashedPassword,

      emailVerified: false,
      emailVerificationCode: verificationCodeHash,
      emailVerificationExpires: verificationExpires,
      emailVerificationAttempts: 0,
    });

    await sendEmailVerificationCode(
      user.email,
      verificationCode
    );

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email for your verification code.",
      email: user.email,
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating your account.",
    });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification request.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Your email is already verified.",
      });
    }

    if (
      !user.emailVerificationCode ||
      !user.emailVerificationExpires
    ) {
      return res.status(400).json({
        success: false,
        message: "Your verification code is no longer valid. Please request a new one.",
      });
    }

    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Your verification code has expired. Please request a new one.",
      });
    }

    if (user.emailVerificationAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new verification code.",
      });
    }

    const codeHash = crypto
      .createHash("sha256")
      .update(code.trim())
      .digest("hex");

    if (codeHash !== user.emailVerificationCode) {
      user.emailVerificationAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "The verification code is incorrect.",
      });
    }

    // Verification successful
    user.emailVerified = true;
    user.emailVerificationCode = "";
    user.emailVerificationExpires = null;
    user.emailVerificationAttempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your email has been verified successfully.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying your email.",
    });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with that email, a verification code has been sent.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified.",
      });
    }

    // Generate a new secure 6-digit code
    const verificationCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Hash the code before storing it
    const verificationCodeHash = crypto
      .createHash("sha256")
      .update(verificationCode)
      .digest("hex");

    user.emailVerificationCode = verificationCodeHash;
    user.emailVerificationExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );
    user.emailVerificationAttempts = 0;

    await user.save();

    await sendEmailVerificationCode(
      user.email,
      verificationCode
    );

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while sending the verification code.",
    });
  }
});


// =========================
// SIGN IN
// =========================
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          message:
            "Please verify your email before signing in.",
          email: user.email,
          emailVerificationRequired: true,
        });
      }

    // Create token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Signed in successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        address: user.address,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to sign in",
      error: error.message,
    });
  }
});

// =========================
// FORGOT PASSWORD
// =========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Always return the same response
    // so attackers cannot discover registered emails
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing it in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 15 minutes
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create password reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Send password reset email
    await sendPasswordResetEmail(
      user.email,
      resetLink
    );

    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
});

// =========================
// RESET PASSWORD
// =========================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate required fields
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash the token received from the user
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid, non-expired reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;

    // Invalidate reset token
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
});


module.exports = router;