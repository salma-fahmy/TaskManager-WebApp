import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsListPage from "./pages/Projects/ProjectsListPage";
import ProjectDetailsPage from "./pages/Projects/ProjectDetailsPage";
import CreateProjectPage from "./pages/Projects/CreateProjectPage"; 
import TasksListPage from "./pages/Tasks/TasksListPage";
import TaskFormPage from "./pages/Tasks/TaskFormPage";
import TaskDetailsPage from "./pages/Tasks/TaskDetailsPage";
import Profile from "./pages/Profile";
import { useRole } from "./hooks/useRole";

// ==========================================================
// Protected route component for Manager-only pages
// ==========================================================
const ManagerRoute = () => {
  const { isManager, isLoadingRole, isAuthenticated } = useRole();

  // Show loading state while checking role
  if (isLoadingRole) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <p>Checking permissions...</p>
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes if user is a manager
  if (isManager) {
    return <Outlet />;
  }

  // Redirect non-manager users to dashboard
  return <Navigate to="/dashboard" replace />;
};

// ==========================================================
// General protected route component for authenticated pages
// ==========================================================
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  
  // Redirect to login if no authentication token is present
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes if authenticated
  return <Outlet />;
};

// ==========================================================
// Main App component containing all routes
// ==========================================================
function App() {
  return (
    <Routes>
      {/* ================= Authentication Pages (No Layout) ================= */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ================= Protected Pages inside MainLayout ================= */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Projects Routes */}
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          
          {/* Manager-only route: Create Project */}
          <Route element={<ManagerRoute />}>
            <Route path="/projects/create" element={<CreateProjectPage />} />
          </Route>

          {/* Tasks Routes */}
          <Route path="/tasks" element={<TasksListPage />} />
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          
          {/* Manager-only routes: Create/Edit Tasks */}
          <Route element={<ManagerRoute />}>
            <Route path="/tasks/create" element={<TaskFormPage />} />
            <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
            <Route path="/projects/:projectId/tasks/create" element={<TaskFormPage />} />
          </Route>

          {/* User Profile */}
          <Route path="/profile" element={<Profile />} />

          {/* Catch-all route: Redirect unknown paths to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
