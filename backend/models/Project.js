const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the Project model representing the 'Projects' table
const Project = sequelize.define('Project', {
  Project_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,     // Auto-increment primary key
    primaryKey: true,
  },
  Title: {
    type: DataTypes.STRING(300),
    allowNull: false,        // Project title, required field
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,         // Optional project description
  },
  Start_Date: {
    type: DataTypes.DATEONLY,
    allowNull: true,         // Optional start date of the project
  },
  End_Date: {
    type: DataTypes.DATEONLY,
    allowNull: true,         // Optional end date of the project
  },
  Status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'New',     // Default status when project is created
  },
  Owner_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,        // Foreign key referencing the user who owns the project
  },
}, {
  tableName: 'Projects',      // Explicit table name
  timestamps: true,           // Enable automatic timestamp fields
  createdAt: 'Created_At',    // Use custom column name for creation timestamp
  updatedAt: 'Updated_At',    // Use custom column name for update timestamp
});

module.exports = Project;
