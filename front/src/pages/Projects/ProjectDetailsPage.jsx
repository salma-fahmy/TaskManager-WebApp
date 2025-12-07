import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TaskCard from "../../components/Tasks/TaskCard";
import { useRole } from "../../hooks/useRole";
import { 
  fetchProjectById, 
  fetchTasksForProject, 
  fetchAllUsers, 
  fetchProjectMembers 
} from "../../api";
import "./ProjectDetailsPage.css";

const ProjectDetailsPage = () => {
  // Get the project ID from the URL parameters
  const { id } = useParams(); 

  // Get current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("currentUserId")); 

  // Get role info (isManager) and loading state from custom hook
  const { isManager, isLoadingRole } = useRole();

  // State to store project details
  const [project, setProject] = useState(null);
  // State to store tasks related to the project
  const [tasks, setTasks] = useState([]);
  // State to store all users (for task assignees)
  const [users, setUsers] = useState([]);
  // State for loading spinner/message
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch project details by ID
        const projectData = await fetchProjectById(id);

        if (!projectData) {
          // If project not found, show error
          setLoading(false);
          setError("Project not found.");
          return;
        }

        // Fetch members of this project
        let membersData = await fetchProjectMembers(projectData.Project_ID);

        // Check if current user can manage this project
        const hasManagementAccess = isManager || projectData.Owner_ID === currentUserId; 

        // Check if current user is a member of the project
        const isMember = membersData.some(m => m.User_ID === currentUserId);

        // If user cannot manage and is not a member, deny access
        if (!hasManagementAccess && !isMember) {
          setLoading(false);
          setError("Access Denied: You are not a member of this project.");
          setProject(null);
          return;
        }

        // Ensure the project owner is included in the members list
        const isOwnerAlreadyListed = membersData.some(m => m.User_ID === projectData.Owner_ID);
        if (!isOwnerAlreadyListed) {
          membersData = [
            ...membersData,
            { Project_ID: projectData.Project_ID, User_ID: projectData.Owner_ID }
          ];
        }

        // Fetch all users for assigning tasks
        const usersData = await fetchAllUsers();
        // Fetch all tasks for this project
        let tasksData = await fetchTasksForProject(projectData.Project_ID);

        // If user cannot manage the project, show only tasks assigned to them
        if (!hasManagementAccess) { 
          tasksData = tasksData.filter(task => task.Assigned_To === currentUserId);
        }

        // Map tasks to include assignee name
        const tasksWithAssignees = tasksData.map(task => {
          const assignee = usersData.find(u => u.User_ID === task.Assigned_To);
          return { ...task, assignee: assignee ? assignee.Name : "Unknown" };
        });

        // Map project members to their names
        const assignedUsers = membersData.map(m => {
          const user = usersData.find(u => u.User_ID === m.User_ID);
          return user ? user.Name : "Unknown";
        });

        // Update state with fetched data
        setProject({ ...projectData, assignedUsers });
        setTasks(tasksWithAssignees);
        setUsers(usersData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("ERROR:", err);
        setLoading(false);
        setError("Failed to load project data. Check API connection.");
      }
    };

    // Only load data once role is determined
    if (!isLoadingRole) {
      loadData();
    }
  }, [id, isLoadingRole, isManager, currentUserId]);

  // Show loading message while fetching
  if (loading || isLoadingRole) return <p>Loading project details...</p>;

  // Show error message if any
  if (error) return <p className="error-text">Error: {error}</p>;

  // If no project data, render nothing
  if (!project) return null;

  // Determine if user can manage project
  const canManageProject = isManager || project.Owner_ID === currentUserId;

  return (
    <div className="project-details-page">
      {/* Project title and description */}
      <h2>{project.Title}</h2>
      <p>{project.Description}</p>

      {/* List of assigned users */}
      <p>
        <strong>Assigned Users:</strong>{" "}
        {project.assignedUsers.length > 0 ? project.assignedUsers.join(", ") : "No members assigned yet."}
      </p>

      <div className="tasks-section">
        <h3>Tasks</h3>

        {/* Button to add new task, visible only to managers or owner */}
        {canManageProject && (
          <Link to={`/projects/${project.Project_ID}/tasks/create`}>
            <button>Add New Task</button>
          </Link>
        )}

        {/* Render task cards or a message if no tasks */}
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard key={task.Task_ID} task={task} users={users} />
          ))
        ) : (
          <p>
            {canManageProject
              ? "No tasks for this project."
              : "You have no assigned tasks in this project."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
