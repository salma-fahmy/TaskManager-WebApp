const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define the Task model representing the 'Tasks' table
const Task = sequelize.define(
  "Task",
  {
    Task_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,         // Auto-increment primary key
      autoIncrement: true,
    },
    Title: {
      type: DataTypes.STRING,
      allowNull: false,         // Task title, required field
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,          // Optional task description
    },
    Status: {
      type: DataTypes.STRING,
      defaultValue: "Open",     // Default task status
    },
    Priority: {
      type: DataTypes.STRING,
      defaultValue: "Normal",   // Default task priority
    },
    Due_Date: {
      type: DataTypes.DATE,
      allowNull: true,          // Optional due date for the task
    },
    Project_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,         // Foreign key referencing associated project
    },
    Assigned_To: {
      type: DataTypes.INTEGER,
      allowNull: false,         // Foreign key referencing the assigned user
    },
  },
  {
    tableName: "Tasks",          // Explicit table name
    timestamps: false,           // Disable automatic timestamps
    freezeTableName: true,       // Prevent Sequelize from pluralizing table name
  }
);

module.exports = Task;
