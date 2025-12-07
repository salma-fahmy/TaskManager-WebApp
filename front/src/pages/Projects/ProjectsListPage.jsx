import React, { useEffect, useState } from "react";
import ProjectCard from "../../components/Projects/ProjectCard";
import { Link } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import {
  fetchProjectsForManager,
  fetchProjectMemberships,
  fetchProjectsByIds
} from "../../api";

const ProjectsListPage = () => {
  // Get the user role and loading state from custom hook
  const { isManager, isLoadingRole } = useRole();

  // Get the current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("currentUserId"));

  // State to store fetched projects
  const [projects, setProjects] = useState([]);
  // State to manage loading spinner/message
  const [loading, setLoading] = useState(true);
  // State to store any error message
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait until the user role is determined
    if (isLoadingRole) return;

    const loadProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        let data = [];

        if (isManager) {
          // 🔹 If the user is a manager, fetch all projects they manage
          data = await fetchProjectsForManager(currentUserId);
        } else {
          // 🔹 If the user is a regular member, fetch projects they are a member of

          // 1) Fetch memberships of the current user
          const memberships = await fetchProjectMemberships(currentUserId);

          // 2) Extract project IDs from memberships
          const projectIds = memberships.map(m => m.Project_ID);

          // 3) Fetch project details based on these IDs
          if (projectIds.length > 0) {
            data = await fetchProjectsByIds(projectIds);
          }
        }

        // Store fetched projects in state
        setProjects(data);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [isLoadingRole, isManager, currentUserId]);

  // Show loading message while fetching
  if (loading || isLoadingRole) return <p>Loading projects...</p>;

  // Show error message if any
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      {isManager && (
        <div style={{ marginBottom: "20px" }}>
          {/* Button for managers to create a new project */}
          <Link to="/projects/create">
            <button>Create New Project</button>
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {projects.length > 0 ? (
          // Render ProjectCard for each project
          projects.map((project) => (
            <ProjectCard key={project.Project_ID} project={project} />
          ))
        ) : (
          // Show message if no projects are found
          <p>
            {isManager
              ? "You do not currently manage any projects."
              : "You are not assigned to any projects."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectsListPage;
