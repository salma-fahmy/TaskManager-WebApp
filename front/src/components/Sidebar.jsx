import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isManager }) => {
  const navigate = useNavigate();

  // Handles user logout by clearing localStorage and redirecting to login page
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("userRole"); 
    navigate("/login");
  };

  return (
    // Sidebar container for navigation links
    <div className="sidebar">
      {/* Sidebar header */}
      <h3>Menu</h3>

      {/* Navigation link to Dashboard */}
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
        Dashboard
      </NavLink>

      {/* Navigation link to Projects */}
      <NavLink to="/projects" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
        Projects
      </NavLink>

      {/* Navigation link to Tasks */}
      <NavLink to="/tasks" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
        Tasks
      </NavLink>

      {/* Conditional link to Create Task for managers only */}
      {isManager && (
        <NavLink to="/tasks/create" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          Create Task
        </NavLink>
      )}

      {/* Logout button */}
      <button className="sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
