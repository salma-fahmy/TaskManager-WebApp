const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');

const { Task } = require("../models");

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

/**
 * @route   GET /
 * @desc    Get all tasks with optional filters (Assigned_To, Project_ID, Status)
 * @access  Private
 */
router.get("/", async (req, res) => {
  try {
    const { Assigned_To, Project_ID, Status } = req.query;

    // Build dynamic WHERE clause for filtering tasks
    let whereClause = {};

    if (Assigned_To) {
      whereClause.Assigned_To = parseInt(Assigned_To);
    }

    if (Project_ID) {
      whereClause.Project_ID = parseInt(Project_ID);
    }

    if (Status) {
      whereClause.Status = Status;
    }

    console.log('Tasks Query WHERE clause:', whereClause);

    // Fetch tasks based on filter criteria
    const tasks = await Task.findAll({ where: whereClause });

    console.log(`Found ${tasks.length} tasks`);

    res.json(tasks);
  } catch (err) {
    console.error('Tasks fetch error:', err);
    res.status(500).json({
      error: "Error fetching tasks",
      details: err.message,
    });
  }
});

/**
 * @route   GET /:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({
      error: "Error fetching task",
      details: err.message,
    });
  }
});

/**
 * @route   POST /
 * @desc    Create a new task
 * @access  Private
 * @validation Validates required fields and their types/formats
 */
router.post(
  "/",
  [
    body('Title').notEmpty().withMessage('Title is required'),
    body('Project_ID').isInt().withMessage('Project ID must be an integer'),
    body('Due_Date').optional().isISO8601().toDate().withMessage('Due date must be a valid date'),
    body('Status').optional()
      .isIn(['To-Do', 'In Progress', 'Done', 'pending', 'in-progress', 'completed'])
      .withMessage('Invalid status'),
  ],
  // Validate request body before processing
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  // Create task handler
  async (req, res) => {
    try {
      const task = await Task.create(req.body);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({
        error: "Error creating task",
        details: err.message,
      });
    }
  }
);

/**
 * @route   PUT /:id
 * @desc    Update an existing task by ID
 * @access  Private
 * @validation Validates optional fields if provided
 */
router.put(
  "/:id",
  [
    body('Title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('Project_ID').optional().isInt().withMessage('Project ID must be an integer'),
    body('Due_Date').optional().isISO8601().toDate().withMessage('Due date must be a valid date'),
    body('Status').optional()
      .isIn(['To-Do', 'In Progress', 'Done', 'pending', 'in-progress', 'completed'])
      .withMessage('Invalid status'),
  ],
  // Validate request body before updating
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  // Update task handler
  async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      await task.update(req.body);
      res.json(task);
    } catch (err) {
      res.status(400).json({
        error: "Error updating task",
        details: err.message,
      });
    }
  }
);

/**
 * @route   DELETE /:id
 * @desc    Delete a task by ID
 * @access  Private
 */
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.destroy();
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({
      error: "Error deleting task",
      details: err.message,
    });
  }
});

module.exports = router;
