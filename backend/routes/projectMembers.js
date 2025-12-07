const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');

const ProjectMember = require('../models/ProjectMember');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * GET /project-members
 * Retrieve all project members
 */
router.get('/', async (req, res) => {
  try {
    const members = await ProjectMember.findAll();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project members', details: error.message });
  }
});

/**
 * GET /project-members/project/:projectId
 * Retrieve members by Project_ID
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const members = await ProjectMember.findAll({
      where: { Project_ID: req.params.projectId }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project members', details: error.message });
  }
});

/**
 * GET /project-members/user/:userId
 * Retrieve projects by User_ID (projects where the user is a member)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const memberships = await ProjectMember.findAll({
      where: { User_ID: req.params.userId }
    });
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user projects', details: error.message });
  }
});

/**
 * POST /project-members
 * Add a new project member
 * Validates required fields
 */
router.post(
  '/',
  [
    body('Project_ID').isInt().withMessage('Project_ID must be an integer'),
    body('User_ID').isInt().withMessage('User_ID must be an integer'),
    body('Role_in_Project').notEmpty().withMessage('Role_in_Project is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    try {
      const { Project_ID, User_ID, Role_in_Project } = req.body;
      const newMember = await ProjectMember.create({ Project_ID, User_ID, Role_in_Project });
      res.status(201).json(newMember);
    } catch (error) {
      res.status(500).json({ error: 'Error adding project member', details: error.message });
    }
  }
);

/**
 * DELETE /project-members
 * Remove a project member by Project_ID and User_ID
 * Validates required fields
 */
router.delete(
  '/',
  [
    body('Project_ID').isInt().withMessage('Project_ID must be an integer'),
    body('User_ID').isInt().withMessage('User_ID must be an integer'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    try {
      const { Project_ID, User_ID } = req.body;
      const member = await ProjectMember.findOne({ where: { Project_ID, User_ID } });
      if (!member) return res.status(404).json({ error: 'Project member not found' });

      await member.destroy();
      res.json({ message: 'Project member removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error removing project member', details: error.message });
    }
  }
);

module.exports = router;
