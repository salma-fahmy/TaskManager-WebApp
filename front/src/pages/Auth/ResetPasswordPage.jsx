import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api";
import './login.css';

const ResetPasswordPage = () => {
  const location = useLocation(); // Access current URL/location
  const navigate = useNavigate(); // Hook to programmatically navigate
  const queryParams = new URLSearchParams(location.search); // Extract query parameters from URL
  const token = queryParams.get("token"); // Extract the reset token from URL

  const [password, setPassword] = useState(""); // State to store new password input
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirming password
  const [error, setError] = useState(""); // State for error messages
  const [message, setMessage] = useState(""); // State for success messages
  const [loading, setLoading] = useState(false); // State for loading indicator during API call

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate that both fields are filled
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setMessage("");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setMessage("");
      return;
    }

    // Validate that passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setMessage("");
      return;
    }

    // Validate that token exists
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
      setMessage("");
      return;
    }

    setLoading(true); // Set loading state
    setError(""); // Clear previous errors
    setMessage(""); // Clear previous success messages

    try {
      // Call API to reset password using token
      await resetPassword(token, password);
      setMessage("Password has been reset successfully! Redirecting to login...");
      setError("");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to reset password. The link may have expired."); // Show error if reset fails
      setMessage("");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="reset-password-page">
      <h2 className="reset-title">Reset Password</h2>
      <p className="reset-info">Enter your new password below.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on input change
            placeholder="Enter new password (min 6 characters)"
            disabled={loading} // Disable input while loading
          />
        </div>

        <div className="form-group">
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Update confirmPassword state
            placeholder="Confirm new password"
            disabled={loading} // Disable input while loading
          />
        </div>

        {error && <p className="error-msg">{error}</p>} {/* Display error message */}
        {message && <p className="success-msg">{message}</p>} {/* Display success message */}

        <button type="submit" disabled={loading} className="reset-btn">
          {loading ? "Resetting..." : "Reset Password"} {/* Show loading text if API request in progress */}
        </button>
      </form>

      <p className="reset-link">
        Back to <Link to="/login">Login</Link> {/* Link to login page */}
      </p>
    </div>
  );
};

export default ResetPasswordPage;
