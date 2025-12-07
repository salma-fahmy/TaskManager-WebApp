const Notification = require('../models/Notification');

// Create Notification
exports.createNotification = async (req, res) => {
    try {
        const { message, userId } = req.body;

        const note = await Notification.create({
            Message: message,
            User_ID: userId
        });

        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notes = await Notification.findAll({
            where: { User_ID: userId }
        });

        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        await Notification.update(
            { Is_Read: 1 },
            { where: { Notification_ID: notificationId } }
        );

        res.json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        await Notification.destroy({
            where: { Notification_ID: notificationId }
        });

        res.json({ message: "Notification deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
