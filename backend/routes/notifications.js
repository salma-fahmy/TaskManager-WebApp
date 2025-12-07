const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');

const Notification = require("../models/Notification");

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * GET /notifications
 * Retrieve all notifications
 */
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.findAll();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications", details: error.message });
  }
});

/**
 * GET /notifications/:id
 * Retrieve a notification by its ID
 */
router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notification", details: error.message });
  }
});

/**
 * POST /notifications
 * Create a new notification
 * Validates required fields and optional ones with proper types
 */
router.post(
  "/",
  [
    body('Message').notEmpty().withMessage('Message is required'),
    body('User_ID').isInt().withMessage('User_ID must be an integer'),
    body('Is_Read').optional().isBoolean().withMessage('Is_Read must be boolean'),
    body('Type').optional().isString().withMessage('Type must be a string'),
    body('Related_ID').optional().isInt().withMessage('Related_ID must be an integer'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    try {
      // Destructure fields with default value for Is_Read
      const { Message, Is_Read = false, User_ID, Type, Related_ID } = req.body;
      const newNotification = await Notification.create({ Message, Is_Read, User_ID, Type, Related_ID });
      res.status(201).json(newNotification);
    } catch (error) {
      res.status(500).json({ error: "Error creating notification", details: error.message });
    }
  }
);

/**
 * PATCH /notifications/:id
 * Update an existing notification partially
 * Validates optional fields if provided
 */
router.patch(
  "/:id",
  [
    body('Message').optional().notEmpty().withMessage('Message cannot be empty'),
    body('Is_Read').optional().isBoolean().withMessage('Is_Read must be boolean'),
    body('Type').optional().isString().withMessage('Type must be a string'),
    body('Related_ID').optional().isInt().withMessage('Related_ID must be an integer'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    try {
      const { id } = req.params;

      const [updatedRows] = await Notification.update(req.body, {
        where: { Notification_ID: id }
      });

      if (updatedRows) {
        const updatedNotification = await Notification.findByPk(id);
        return res.json(updatedNotification);
      }

      return res.status(404).json({ error: "Notification not found or no changes made" });
    } catch (error) {
      res.status(500).json({ error: "Error updating notification", details: error.message });
    }
  }
);

/**
 * DELETE /notifications/:id
 * Delete a notification by its ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedCount = await Notification.destroy({
      where: { Notification_ID: req.params.id },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting notification", details: error.message });
  }
});

module.exports = router;
