const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the User model representing the 'Users' table
const User = sequelize.define('User', {
  User_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,          // Auto-increment primary key
    autoIncrement: true,
  },
  Name: {
    type: DataTypes.STRING(200),
    allowNull: false,          // User's full name, required
  },
  Email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,              // User's email must be unique
  },
  Password: {
    type: DataTypes.STRING(500),
    allowNull: false,          // Hashed password
  },
  Role: {
    type: DataTypes.STRING(50),
    allowNull: false,          // User role (e.g., admin, member)
  },
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,        // Token used for password reset
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,        // Expiration date for reset token
  },
}, {
  tableName: 'Users',          // Explicit table name
  timestamps: true,            // Enable timestamps
  createdAt: 'Created_At',     // Custom createdAt column
  updatedAt: 'Updated_At',     // Custom updatedAt column
});

module.exports = User;
