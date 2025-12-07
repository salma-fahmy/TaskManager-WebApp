const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');

const Attachment = require("../models/Attachment");

// Apply JWT authentication middleware to all routes in this router
router.use(authenticateToken);

/**
 * GET /attachments
 * Retrieve all attachments
 */
router.get("/", async (req, res) => {
  try {
    const attachments = await Attachment.findAll();
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching attachments", details: error.message });
  }
});

/**
 * GET /attachments/:id
 * Retrieve a specific attachment by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    res.json(attachment);
  } catch (error) {
    res.status(500).json({ error: "Error fetching attachment", details: error.message });
  }
});

/**
 * POST /attachments
 * Create a new attachment
 * Request body validation:
 * - File_Name: required, non-empty string
 * - File_URL: required, valid URL string
 * - Task_ID: required, integer
 */
router.post(
  "/",
  [
    body('File_Name').notEmpty().withMessage('File_Name is required'),
    body('File_URL').isURL().withMessage('File_URL must be a valid URL'),
    body('Task_ID').isInt().withMessage('Task_ID must be an integer'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    try {
      const { File_Name, File_URL, Task_ID } = req.body;
      const newAttachment = await Attachment.create({ File_Name, File_URL, Task_ID });
      res.status(201).json(newAttachment);
    } catch (error) {
      res.status(500).json({ error: "Error creating attachment", details: error.message });
    }
  }
);

/**
 * PUT /attachments/:id
 * Update an existing attachment's File_Name and/or File_URL
 * Request body validation (optional fields):
 * - File_Name: if present, must be non-empty string
 * - File_URL: if present, must be valid URL string
 */
router.put(
  "/:id",
  [
    body('File_Name').optional().notEmpty().withMessage('File_Name cannot be empty'),
    body('File_URL').optional().isURL().withMessage('File_URL must be a valid URL'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    try {
      const attachment = await Attachment.findByPk(req.params.id);
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }
      const { File_Name, File_URL } = req.body;
      if (File_Name !== undefined) attachment.File_Name = File_Name;
      if (File_URL !== undefined) attachment.File_URL = File_URL;
      await attachment.save();
      res.json(attachment);
    } catch (error) {
      res.status(500).json({ error: "Error updating attachment", details: error.message });
    }
  }
);

/**
 * DELETE /attachments/:id
 * Delete an attachment by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    await attachment.destroy();
    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting attachment", details: error.message });
  }
});

module.exports = router;
