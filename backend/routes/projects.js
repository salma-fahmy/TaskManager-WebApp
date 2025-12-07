const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const Project = require('../models/Project');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /
 * @desc    Get all projects
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects', details: error.message });
  }
});

/**
 * @route   GET /:id
 * @desc    Get a single project by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project', details: error.message });
  }
});

/**
 * @route   POST /
 * @desc    Create a new project
 * @access  Private
 * @validation Checks required fields and validates types/formats
 */
router.post(
  '/',
  [
    // Title is mandatory and must not be empty
    body('Title').notEmpty().withMessage('Title is required'),

    // Description is optional, must be string if provided
    body('Description').optional().isString(),

    // Start_Date and End_Date are optional but must be valid ISO dates if provided
    body('Start_Date').optional().isISO8601().toDate().withMessage('Start_Date must be a valid date'),
    body('End_Date').optional().isISO8601().toDate().withMessage('End_Date must be a valid date'),

    // Status is optional but must be one of the allowed values if provided
    body('Status')
      .optional()
      .isIn(['planned', 'in progress', 'completed', 'on hold'])
      .withMessage('Invalid Status'),

    // Owner_ID is required and must be an integer
    body('Owner_ID').isInt().withMessage('Owner_ID must be an integer'),
  ],
  // Handle validation errors before controller logic
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },
  // Create project controller
  async (req, res) => {
    try {
      const { Title, Description, Start_Date, End_Date, Status, Owner_ID } = req.body;

      const newProject = await Project.create({
        Title,
        Description,
        Start_Date,
        End_Date,
        Status,
        Owner_ID,
      });

      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ error: 'Error creating project', details: error.message });
    }
  }
);

/**
 * @route   PUT /:id
 * @desc    Update an existing project by ID
 * @access  Private
 * @validation Checks optional fields for validity
 */
router.put(
  '/:id',
  [
    // Optional validation for each field on update
    body('Title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('Description').optional().isString(),
    body('Start_Date').optional().isISO8601().toDate().withMessage('Start_Date must be a valid date'),
    body('End_Date').optional().isISO8601().toDate().withMessage('End_Date must be a valid date'),
    body('Status')
      .optional()
      .isIn(['planned', 'in progress', 'completed', 'on hold'])
      .withMessage('Invalid Status'),
    body('Owner_ID').optional().isInt().withMessage('Owner_ID must be an integer'),
  ],
  // Validate request data before proceeding
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },
  // Update project controller
  async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { Title, Description, Start_Date, End_Date, Status, Owner_ID } = req.body;

      // Update only the provided fields
      await project.update({
        Title,
        Description,
        Start_Date,
        End_Date,
        Status,
        Owner_ID,
      });

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Error updating project', details: error.message });
    }
  }
);

/**
 * @route   DELETE /:id
 * @desc    Delete a project by ID
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.destroy();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting project', details: error.message });
  }
});

module.exports = router;
