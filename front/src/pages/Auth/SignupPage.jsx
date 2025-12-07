import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './login.css';

const API_BASE_URL = "http://localhost:5000"; // Base URL of the API server

const SignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(""); // State to store user's name input
  const [email, setEmail] = useState(""); // State to store user's email input
  const [password, setPassword] = useState(""); // State to store user's password input
  const [confirmPassword, setConfirmPassword] = useState(""); // State for password confirmation
  const [role, setRole] = useState("Team Member"); // State for user's role, default is "Team Member"
  const [error, setError] = useState(""); // State for error messages
  const [success, setSuccess] = useState(""); // State for success messages
  const [loading, setLoading] = useState(false); // State for loading indicator during API call

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    // Validate that all fields are filled
    if (!name || !email || !password || !confirmPassword || !role) {
      setError("All fields are required");
      return;
    }

    // Validate that password and confirmPassword match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true); // Set loading state while API request is in progress

    try {
      const newUser = {
        Name: name,
        Email: email,
        Password: password,
        Role: role,
      };

      // Make POST request to API to create new user
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        // If signup successful, show success message and redirect to login
        setSuccess("Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        // If server returns error, extract message and display
        const errorData = await res.json();
        setError(errorData.error || "Failed to signup. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later."); // Display generic error if request fails
    } finally {
      setLoading(false); // Reset loading state after API call
    }
  };

  return (
    <div className="signup-page">
      <h2 className="signup-title">Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)} // Update name state on input change
            placeholder="Enter your name"
            disabled={loading} // Disable input while loading
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on input change
            placeholder="Enter your email"
            disabled={loading} // Disable input while loading
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on input change
            placeholder="Enter your password"
            disabled={loading} // Disable input while loading
          />
        </div>

        <div className="form-group">
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Update confirmPassword state
            placeholder="Confirm your password"
            disabled={loading} // Disable input while loading
          />
        </div>

        {/* Role selection section */}
        <div className="role-section">
          <label className="role-label">Select Role:</label>

          <label className="role-option">
            <input
              type="radio"
              name="role"
              value="Team Member"
              checked={role === "Team Member"} // Check if current role is "Team Member"
              onChange={() => setRole("Team Member")} // Update role state on selection
              disabled={loading} // Disable input while loading
            />
            Team Member
          </label>

          <label className="role-option">
            <input
              type="radio"
              name="role"
              value="Manager"
              checked={role === "Manager"} // Check if current role is "Manager"
              onChange={() => setRole("Manager")} // Update role state on selection
              disabled={loading} // Disable input while loading
            />
            Manager
          </label>
        </div>

        {error && <p className="error-msg">{error}</p>} {/* Display error message */}
        {success && <p className="success-msg">{success}</p>} {/* Display success message */}

        <button type="submit" disabled={loading} className="signup-btn">
          {loading ? "Signing up..." : "Sign Up"} {/* Show loading text if API request in progress */}
        </button>
      </form>

      <p className="signup-link">
        Already have an account? <Link to="/login">Login here</Link> {/* Link to login page */}
      </p>
    </div>
  );
};

export default SignupPage;
