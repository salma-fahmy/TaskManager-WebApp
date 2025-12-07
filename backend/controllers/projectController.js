const Project = require('../models/Project');
const ProjectMembers = require('../models/ProjectMembers');

// Create new project
exports.createProject = async (req, res) => {
    try {
        const { title, description, startDate, endDate, ownerId } = req.body;

        const project = await Project.create({
            Title: title,
            Description: description,
            Start_Date: startDate,
            End_Date: endDate,
            Owner_ID: ownerId
        });

        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add user to project
exports.addMember = async (req, res) => {
    try {
        const { projectId, userId, role } = req.body;

        const member = await ProjectMembers.create({
            Project_ID: projectId,
            User_ID: userId,
            Role_in_Project: role
        });

        res.status(201).json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
