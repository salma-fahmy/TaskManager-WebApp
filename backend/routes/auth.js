const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const { User } = require("../models");

/* ========================= SIGNUP ========================= */
/**
 * POST /signup
 * User registration endpoint
 * Validates input, hashes password, creates user, and returns user data without password
 */
router.post(
  "/signup",
  [
    body("Name").notEmpty().withMessage("Name is required"),
    body("Email").isEmail().withMessage("Valid email is required"),
    body("Password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("Role").optional().isIn(["Admin", "Manager", "User"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { Name, Email, Password, Role } = req.body;

      // Check if email is already registered
      const existingUser = await User.findOne({ where: { Email } });
      if (existingUser) return res.status(400).json({ error: "Email already in use" });

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(Password, 10);

      // Create new user
      const user = await User.create({
        Name,
        Email,
        Password: hashedPassword,
        Role: Role || "User",
      });

      // Remove password from returned user data
      const userData = user.toJSON();
      delete userData.Password;

      res.status(201).json({ message: "User created successfully", user: userData });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/* ========================= LOGIN ========================= */
/**
 * POST /login
 * User login endpoint
 * Validates input, checks credentials, returns JWT token and user data without password
 */
router.post(
  "/login",
  [
    body("Email").isEmail().withMessage("Valid email is required"),
    body("Password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { Email, Password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { Email } });
      if (!user) return res.status(400).json({ error: "Invalid email or password" });

      // Verify password
      const validPassword = await bcrypt.compare(Password, user.Password);
      if (!validPassword) return res.status(400).json({ error: "Invalid email or password" });

      // Generate JWT token with user ID and role
      const token = jwt.sign(
        { User_ID: user.User_ID, Role: user.Role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Remove password from user data before sending response
      const userData = user.toJSON();
      delete userData.Password;

      res.json({ token, user: userData });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/* ========================= FORGOT PASSWORD ========================= */
/**
 * POST /forgot-password
 * Sends a password reset token to user's email
 * (Here, the reset link is logged to console for demonstration)
 */
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { Email: email } });

      if (!user) {
        return res.status(404).json({ error: "User with this email not found" });
      }

      // Generate reset token and expiry (1 hour)
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      // Update user with reset token info
      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      });

      // Construct reset link (for frontend)
      const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

      // Log reset link (replace with email sending in production)
      console.log("=== Password Reset Link ===");
      console.log(`User: ${user.Email}`);
      console.log(`Link: ${resetLink}`);
      console.log("===========================");

      res.json({
        message: "Password reset link sent successfully",
        resetLink: process.env.NODE_ENV === "development" ? resetLink : undefined,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  }
);

/* ========================= RESET PASSWORD ========================= */
/**
 * POST /reset-password
 * Resets user's password using a valid token and new password
 */
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { token, password } = req.body;

      // Find user by reset token
      const user = await User.findOne({ where: { resetPasswordToken: token } });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      // Check if token is expired
      if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
        return res.status(400).json({ error: "Reset token has expired. Please request a new one." });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's password and clear reset token fields
      await user.update({
        Password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      res.json({ message: "Password reset successful. You can now login with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  }
);

module.exports = router;
