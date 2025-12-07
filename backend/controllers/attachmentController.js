const Attachment = require('../models/Attachment');

// Upload attachment (URL only)
exports.uploadAttachment = async (req, res) => {
    try {
        const { fileName, fileUrl, taskId } = req.body;

        const file = await Attachment.create({
            File_Name: fileName,
            File_URL: fileUrl,
            Task_ID: taskId
        });

        res.status(201).json(file);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get attachments for task
exports.getAttachments = async (req, res) => {
    try {
        const { taskId } = req.params;

        const files = await Attachment.findAll({
            where: { Task_ID: taskId }
        });

        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete attachment
exports.deleteAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;

        await Attachment.destroy({ where: { Attachment_ID: attachmentId } });

        res.json({ message: "Attachment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
