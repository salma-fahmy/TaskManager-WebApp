import React, { useEffect, useState } from "react";
import TaskCard from "../../components/Tasks/TaskCard";
import { Link } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import { 
  fetchAllTasks, 
  fetchTasksForUser, 
  fetchAllUsers,
  fetchProjectsForManager
} from "../../api";
import "./TasksListPage.css"; // Import CSS for styling

const TasksListPage = () => {
  // Get user role info and role loading state
  const { isManager, isLoadingRole } = useRole();

  // Get current logged-in user ID from local storage
  const currentUserId = parseInt(localStorage.getItem("currentUserId"));

  // ---------- State ----------
  const [tasks, setTasks] = useState([]); // List of all tasks to display
  const [users, setUsers] = useState([]); // List of all users (for assignee info)
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error messages

  // ---------- Filters ----------
  const [search, setSearch] = useState(""); // Search by task title
  const [filterStatus, setFilterStatus] = useState(""); // Filter by status
  const [filterAssignee, setFilterAssignee] = useState(""); // Filter by assignee

  // ---------- Load tasks and users on component mount or role change ----------
  useEffect(() => {
    if (isLoadingRole) return; // Wait until role info is loaded

    const loadTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        let tasksData = [];

        if (isManager) {
          // Fetch projects managed by this manager
          const managerProjects = await fetchProjectsForManager(currentUserId);
          const managerProjectIds = managerProjects.map(p => p.Project_ID);

          // Fetch all tasks
          const allTasks = await fetchAllTasks();

          // Filter tasks to only those in managed projects or created by this manager
          tasksData = allTasks.filter(
            task => managerProjectIds.includes(task.Project_ID) || task.Created_By === currentUserId
          );
        } else {
          // For regular users, fetch tasks assigned to them
          tasksData = await fetchTasksForUser(currentUserId);
        }

        // Fetch all users to map task assignees
        const usersData = await fetchAllUsers();

        // Map tasks to include assignee name
        const tasksWithUsers = tasksData.map(task => {
          const assignee = usersData.find(u => u.User_ID === task.Assigned_To);
          return {
            ...task,
            assignee: assignee ? assignee.Name : "Unassigned"
          };
        });

        // Update state
        setTasks(tasksWithUsers);
        setUsers(usersData);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [isLoadingRole, isManager, currentUserId]);

  // ---------- Apply filters ----------
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.Title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus ? task.Status === filterStatus : true;
    const matchesAssignee = filterAssignee ? task.assignee === filterAssignee : true;
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  // ---------- Handle Loading State ----------
  if (loading || isLoadingRole) {
    return (
      <div className="loading-box">
        <p>Loading tasks...</p>
      </div>
    );
  }

  // ---------- Handle Error State ----------
  if (error) {
    return (
      <div className="error-box">
        <p className="error-text">Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Create assignee options for filter dropdown
  const assigneeOptions = ["Unassigned", ...users.map(u => u.Name)];

  // ---------- Render Page ----------
  return (
    <div className="tasks-list-page">

      {/* Page Title */}
      <h2>{isManager ? "My Managed Tasks" : "My Assigned Tasks"}</h2>

      {/* Create Task Button (only for managers) */}
      {isManager && (
        <div className="create-task-wrapper">
          <Link to="/tasks/create">
            <button className="create-task-btn">+ Create New Task</button>
          </Link>
        </div>
      )}

      {/* ---------- Filters Section ---------- */}
      <div className="tasks-filters">
        {/* Search by title */}
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Filter by status */}
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="To-Do">To-Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        {/* Filter by assignee (managers only) */}
        {isManager && (
          <select 
            value={filterAssignee} 
            onChange={e => setFilterAssignee(e.target.value)}
          >
            <option value="">All Assignees</option>
            {assigneeOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
      </div>

      {/* ---------- Tasks Counter ---------- */}
      <p className="tasks-counter">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </p>

      {/* ---------- Tasks List ---------- */}
      <div className="tasks-list">
        {filteredTasks.length > 0 ? (
          // Render TaskCard component for each task
          filteredTasks.map(task => (
            <TaskCard key={task.Task_ID} task={task} users={users} />
          ))
        ) : (
          // Show message if no tasks match filters
          <div className="no-tasks">
            <p>
              {search || filterStatus || filterAssignee
                ? "No tasks match your filters."
                : isManager
                ? "No tasks available for your managed projects."
                : "You have no assigned tasks."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksListPage;
