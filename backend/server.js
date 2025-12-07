const express = require("express");
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require("dotenv").config();

const sequelize = require("./config/db");
const authenticateToken = require('./middleware/auth');

const app = express();

const morgan = require('morgan');

// Middleware for logging HTTP requests in 'dev' format
app.use(morgan('dev'));

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Set security HTTP headers using Helmet
app.use(helmet());

// Apply rate limiting to prevent brute-force and DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Limit each IP to 100 requests per windowMs
  standardHeaders: true,    // Return rate limit info in the RateLimit-* headers
});
app.use(limiter);

// Middleware to parse incoming JSON requests
app.use(express.json());

// Public routes (no authentication required)
const authRouter = require('./routes/auth');
app.use('/auth', authRouter); // Authentication routes (login, signup, etc.)

// Users routes (some may require authentication internally)
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

// Apply authentication middleware for all routes below this line
app.use(authenticateToken);

// Protected routes (require valid JWT token)
const tasksRouter = require('./routes/tasks');
app.use('/tasks', tasksRouter);

const commentsRouter = require("./routes/comments");
app.use("/comments", commentsRouter);

const attachmentsRouter = require('./routes/attachments');
app.use('/attachments', attachmentsRouter);

const notificationsRouter = require('./routes/notifications');
app.use('/notifications', notificationsRouter);

const projectsRouter = require('./routes/projects');
app.use('/projects', projectsRouter);

const projectMembersRouter = require('./routes/projectMembers');
app.use('/projectMembers', projectMembersRouter);

// Global error handling middleware - catches all errors
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Initialize all models and associations (if any)
require("./models");

// Basic route to check if server is running
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start the server and connect to the database
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await sequelize.authenticate();
    console.log("Database connected!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
