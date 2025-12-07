// LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api";
import './login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // State to store user's email input
  const [password, setPassword] = useState(""); // State to store user's password input
  const [error, setError] = useState(""); // State to store error messages
  const [loading, setLoading] = useState(false); // State to indicate loading during API call

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(""); // Clear any previous error messages

    // Check if both email and password are provided
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true); // Set loading state to true while making API request

    try {
      // Call the login API with email and password
      const data = await loginUser({ Email: email, Password: password });

      // Check if user data exists in the response
      if (!data.user || !data.user.User_ID) {
        throw new Error("User data not found in response");
      }

      // Save the token in localStorage
      localStorage.setItem("token", data.token);

      // Save the complete user object in localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Save the user ID in localStorage
      localStorage.setItem("currentUserId", data.user.User_ID.toString());

      // Save the user's role with validation
      if (data.user.Role) {
        localStorage.setItem("userRole", data.user.Role);
      } else {
        console.warn("User role is missing from API response. Defaulting to 'User'");
        localStorage.setItem("userRole", "User"); // Default role if missing
      }

      // Redirect to dashboard after successful login
      navigate("/dashboard");
    } catch (err) {
      // Display error message if login fails
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false); // Reset loading state after API call
    }
  };

  return (
    <div className="login-page">
      <h2 className="login-title">Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on input change
            placeholder="Enter your email"
            disabled={loading} // Disable input while loading
            required
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
            required
          />
        </div>

        {error && <div className="error-box">{error}</div>} {/* Display error message */}

        <button type="submit" disabled={loading} className="login-btn">
          {loading ? "Logging in..." : "Login"} {/* Show loading text if API call is in progress */}
        </button>
      </form>

      <div className="links-section">
        <p>
          Forgot password? <Link to="/forgot-password">Reset here</Link>
        </p>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
