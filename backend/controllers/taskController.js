const Task = require('../models/Task');

// Create task
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;

        const task = await Task.create({
            Title: title,
            Description: description,
            Status: status,
            Priority: priority,
            Due_Date: dueDate,
            Project_ID: projectId,
            Assigned_To: assignedTo
        });

        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get tasks for a project
exports.getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;

        const tasks = await Task.findAll({ where: { Project_ID: projectId } });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;

        await Task.update(updates, { where: { Task_ID: taskId } });

        res.json({ message: "Task updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
