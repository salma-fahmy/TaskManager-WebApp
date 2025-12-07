const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define the Comment model representing the 'Comments' table
const Comment = sequelize.define("Comment", {
  Comment_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,   // Auto-increment primary key
    primaryKey: true,
  },
  Comment_Text: {
    type: DataTypes.TEXT,
    allowNull: false,       // Text content of the comment, cannot be null
  },
  Created_At: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,  // Timestamp when comment was created
  },
  Task_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,       // Foreign key referencing the related task
  },
  User_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,       // Foreign key referencing the user who made the comment
  }
}, {
  tableName: "Comments",    // Explicitly specify table name
  timestamps: false,        // Disable automatic timestamps (createdAt, updatedAt)
});

module.exports = Comment;
