const User = require("./User");
const Project = require("./Project");
const ProjectMember = require("./ProjectMember");
const Task = require("./Task");
const Comment = require("./Comment");
const Attachment = require("./Attachment");
const Notification = require("./Notification");

/* -------------------------------------------
   1) User ↔ Project (One-to-Many as Owner)
   - A user can own many projects
   - Each project belongs to one user (owner)
------------------------------------------- */
User.hasMany(Project, { foreignKey: "Owner_ID" });
Project.belongsTo(User, { foreignKey: "Owner_ID" });

/* -------------------------------------------
   2) User ↔ Project ↔ ProjectMember (Many-to-Many)
   - Users can be members of many projects
   - Projects can have many users as members
   - Relationship is managed through ProjectMember join table
------------------------------------------- */
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: "User_ID",
});

Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: "Project_ID",
});

/* -------------------------------------------
   3) Project ↔ Task (One-to-Many)
   - A project can have many tasks
   - Each task belongs to one project
------------------------------------------- */
Project.hasMany(Task, { foreignKey: "Project_ID" });
Task.belongsTo(Project, { foreignKey: "Project_ID" });

/* -------------------------------------------
   4) User ↔ Task (One-to-Many as Assignee)
   - A user can be assigned many tasks
   - Each task is assigned to one user
------------------------------------------- */
User.hasMany(Task, { foreignKey: "Assigned_To" });
Task.belongsTo(User, { foreignKey: "Assigned_To" });

/* -------------------------------------------
   5) Task ↔ Comment (One-to-Many)
   - A task can have multiple comments
   - Each comment belongs to one task
------------------------------------------- */
Task.hasMany(Comment, { foreignKey: "Task_ID" });
Comment.belongsTo(Task, { foreignKey: "Task_ID" });

/* -------------------------------------------
   6) User ↔ Comment (One-to-Many)
   - A user can write many comments
   - Each comment belongs to one user (author)
------------------------------------------- */
User.hasMany(Comment, { foreignKey: "User_ID" });
Comment.belongsTo(User, { foreignKey: "User_ID" });

/* -------------------------------------------
   7) Task ↔ Attachment (One-to-Many)
   - A task can have multiple attachments
   - Each attachment belongs to one task
------------------------------------------- */
Task.hasMany(Attachment, { foreignKey: "Task_ID" });
Attachment.belongsTo(Task, { foreignKey: "Task_ID" });

/* -------------------------------------------
   8) User ↔ Notification (One-to-Many)
   - A user can have many notifications
   - Each notification belongs to one user
------------------------------------------- */
User.hasMany(Notification, { foreignKey: "User_ID" });
Notification.belongsTo(User, { foreignKey: "User_ID" });

module.exports = {
  User,
  Project,
  ProjectMember,
  Task,
  Comment,
  Attachment,
  Notification,
};
