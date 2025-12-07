const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the ProjectMember model representing the 'Project_Members' join table
const ProjectMember = sequelize.define('ProjectMember', {
  Project_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,          // Part of composite primary key
    allowNull: false,
  },
  User_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,          // Part of composite primary key
    allowNull: false,
  },
  Joined_At: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,  // Timestamp when user joined the project
  },
  Role_in_Project: {
    type: DataTypes.STRING(100),
    allowNull: true,           // Optional role of the user within the project
  },
}, {
  tableName: 'Project_Members',  // Explicit table name
  timestamps: false,             // Disable automatic timestamps
});

module.exports = ProjectMember;
