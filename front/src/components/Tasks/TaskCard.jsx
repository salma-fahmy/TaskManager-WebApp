import React from "react";
import { Link } from "react-router-dom";
import "./TaskCard.css";

const TaskCard = ({ task }) => {
  // Determine CSS class for task status to style accordingly
  const getStatusClass = (status) => {
    switch (status) {
      case "To-Do":
        return "status todo";
      case "In Progress":
        return "status inprogress";
      case "Done":
        return "status done";
      default:
        return "status default";
    }
  };

  // Determine CSS class for assignee to differentiate between assigned and unassigned tasks
  const assigneeClass =
    task.assignee === "Unassigned"
      ? "assignee unassigned"
      : "assignee assigned";

  return (
    // Container card for individual task information
    <div className="task-card">
      {/* Display task title */}
      <h4 className="task-title">{task.Title}</h4>

      {/* Display task status with dynamic styling */}
      <p className="task-desc">
        <strong>Status:</strong>{" "}
        <span className={getStatusClass(task.Status)}>{task.Status}</span>
      </p>

      {/* Display task assignee with conditional styling */}
      <p className="task-desc">
        <strong>Assignee:</strong>{" "}
        <span className={assigneeClass}>{task.assignee}</span>
      </p>

      {/* Display task priority */}
      <p className="task-desc">
        <strong>Priority:</strong> {task.Priority || "N/A"}
      </p>

      {/* Display task due date */}
      <p className="task-desc">
        <strong>Due Date:</strong> {task.Due_Date || "N/A"}
      </p>

      {/* Navigation button linking to detailed task page */}
      <Link to={`/tasks/${task.Task_ID}`}>
        <button className="view-task-btn">View Task</button>
      </Link>
    </div>
  );
};

export default TaskCard;
