const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define the Notification model representing the 'Notifications' table
const Notification = sequelize.define("Notification", {
  Notification_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,    // Auto-increment primary key
    primaryKey: true,
  },
  Message: {
    type: DataTypes.TEXT,
    allowNull: false,       // Notification message content
  },
  Is_Read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,    // Flag to indicate if notification has been read
  },
  User_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,       // Foreign key referencing the user who receives the notification
  }
}, {
  tableName: "Notifications",  // Explicit table name
  timestamps: true,            // Enable timestamps
  createdAt: "Created_At",    // Use custom column name for creation time
  updatedAt: false             // Disable updatedAt column
});

module.exports = Notification;
