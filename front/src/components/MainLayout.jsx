import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { useRole } from "../hooks/useRole";
import "./MainLayout.css"; 

const MainLayout = () => {
  const { isManager, isLoadingRole } = useRole();

  // Display loading state while user role is being fetched
  if (isLoadingRole) {
    return <p>Loading user permissions...</p>;
  }

  return (
    // Main layout container with sidebar and content area
    <div className="main-layout">
      {/* Sidebar section with conditional rendering based on user role */}
      <aside className="main-sidebar">
        <Sidebar isManager={isManager} />
      </aside>

      {/* Main content area including header and page content */}
      <main className="main-content">
        {/* Header component displaying user info and navigation */}
        <Header />

        {/* Dynamic page content rendered by React Router */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
