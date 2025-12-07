const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define the Attachment model representing the 'Attachments' table
const Attachment = sequelize.define("Attachment", {
    Attachment_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,   // Auto-increment primary key
    primaryKey: true,
  },
  File_Name: {
    type: DataTypes.STRING(400),
    allowNull: false,       // File name cannot be null
  },
  File_URL: {
    type: DataTypes.STRING(2000),
    allowNull: false,       // URL to the file cannot be null
  },
  Uploaded_At: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,  // Automatically set upload timestamp
  },
  Task_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,       // Foreign key referencing associated task
  }
}, {
  tableName: "Attachments", // Explicitly specify table name
  timestamps: false,        // Disable automatic timestamps (createdAt, updatedAt)
});

module.exports = Attachment;
