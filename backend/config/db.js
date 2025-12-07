const { Sequelize } = require('sequelize');

// Initialize Sequelize instance for SQL Server connection
const sequelize = new Sequelize(
  process.env.DB_NAME,   // Database name
  process.env.DB_USER,   // Database username
  process.env.DB_PASS,   // Database password
  {
    host: process.env.DB_HOST,     // SQL Server host
    dialect: 'mssql',              // Database type
    port: process.env.DB_PORT,     // SQL Server port
    dialectOptions: {
      options: {
        encrypt: false,             // Disable encryption (optional for local dev)
        trustServerCertificate: true, // Accept untrusted certificates (local dev)
      }
    },
    logging: false, // Disable SQL query logging for cleaner console output
  }
);

// Export the Sequelize instance to be used across the project
module.exports = sequelize;
