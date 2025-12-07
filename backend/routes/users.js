const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const { User } = require('../models');

/**
 * Middleware to log requests on this router
 * Applies authentication to all routes except POST /users (user registration)
 */
router.use((req, res, next) => {
  console.log('Users Router Middleware:', req.method, req.path);

  // Skip authentication for user creation route
  if (req.method === 'POST' && req.path === '/') {
    return next();
  }

  // Apply authentication middleware for all other requests
  authenticateToken(req, res, next);
});

/**
 * @route   GET /
 * @desc    Get all users excluding passwords
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['Password'] }, // Never expose passwords
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /:id
 * @desc    Get user by ID excluding password
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['Password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /
 * @desc    Register a new user
 * @access  Public
 * @validation Validates user input and hashes password before saving
 */
router.post(
  '/',
  [
    body('Name').notEmpty().withMessage('Name is required'),
    body('Email').isEmail().withMessage('Valid Email is required'),
    body('Password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('Role').notEmpty().withMessage('Role is required'),
  ],
  async (req, res) => {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { Name, Email, Password, Role } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ where: { Email } });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });

      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(Password, 10);

      // Create new user
      const newUser = await User.create({
        Name,
        Email,
        Password: hashedPassword,
        Role,
      });

      // Remove password field before sending response
      const userData = newUser.toJSON();
      delete userData.Password;

      res.status(201).json(userData);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @route   PUT /:id
 * @desc    Update user data by ID
 * @access  Private
 * @validation Validates optional email and password fields; hashes password if updated
 */
router.put(
  '/:id',
  [
    body('Email').optional().isEmail().withMessage('Valid Email is required'),
    body('Password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Hash password if it is being updated
      if (req.body.Password) {
        req.body.Password = await bcrypt.hash(req.body.Password, 10);
      }

      // Update user fields
      await user.update(req.body);

      // Remove password from response
      const updatedUser = user.toJSON();
      delete updatedUser.Password;

      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @route   DELETE /:id
 * @desc    Delete user by ID
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
