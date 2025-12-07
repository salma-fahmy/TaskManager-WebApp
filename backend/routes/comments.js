const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');

const Comment = require("../models/Comment");

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * GET /comments
 * Retrieve all comments
 */
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.findAll();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching comments", details: error.message });
  }
});

/**
 * GET /comments/:id
 * Retrieve a comment by its ID
 */
router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Error fetching comment", details: error.message });
  }
});

/**
 * POST /comments
 * Create a new comment
 * Validates that Task_ID and User_ID are integers and Comment_Text is provided
 */
router.post(
  "/",
  [
    body('Task_ID').isInt().withMessage('Task_ID must be an integer'),
    body('User_ID').isInt().withMessage('User_ID must be an integer'),
    body('Comment_Text').notEmpty().withMessage('Comment_Text is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    try {
      const { Task_ID, User_ID, Comment_Text } = req.body;
      const newComment = await Comment.create({ Task_ID, User_ID, Comment_Text });
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ error: "Error creating comment", details: error.message });
    }
  }
);

/**
 * PUT /comments/:id
 * Update the text of an existing comment
 * Validates that Comment_Text is provided and not empty
 */
router.put(
  "/:id",
  [
    body('Comment_Text').notEmpty().withMessage('Comment_Text is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      comment.Comment_Text = req.body.Comment_Text;
      await comment.save();
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Error updating comment", details: error.message });
    }
  }
);

/**
 * DELETE /comments/:id
 * Delete a comment by its ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    await comment.destroy();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment", details: error.message });
  }
});

module.exports = router;
