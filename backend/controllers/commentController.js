const Comment = require('../models/Comment');

// Create comment
exports.createComment = async (req, res) => {
    try {
        const { commentText, taskId, userId } = req.body;

        const comment = await Comment.create({
            Comment_Text: commentText,
            Task_ID: taskId,
            User_ID: userId
        });

        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get comments for a task
exports.getCommentsByTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const comments = await Comment.findAll({
            where: { Task_ID: taskId }
        });

        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete comment
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        await Comment.destroy({ where: { Comment_ID: commentId } });

        res.json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
