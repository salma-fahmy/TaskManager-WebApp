import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset, checkUserByEmail } from "../../api";
import './login.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState(""); // State to store user's email input
  const [message, setMessage] = useState(""); // State for success messages
  const [error, setError] = useState(""); // State for error messages
  const [loading, setLoading] = useState(false); // State for loading indicator during API call

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate that email is entered
    if (!email) {
      setError("Please enter your email");
      setMessage(""); // Clear previous success messages
      return;
    }

    setLoading(true); // Set loading state
    setError(""); // Clear previous errors
    setMessage(""); // Clear previous success messages

    try {
      // Check if user exists in the system by email
      const user = await checkUserByEmail(email);

      if (!user) {
        setError("Email not found in our system"); // Show error if email not registered
        setLoading(false);
        return;
      }

      try {
        // Attempt to send password reset request
        await requestPasswordReset(email);
        setMessage(`Password reset link sent to ${email}. Please check your inbox.`);
        setError("");
      } catch (resetError) {
        // Fallback if backend endpoint is not fully implemented
        console.log("Backend forgot-password endpoint not available, using fallback");
        setMessage(`Password reset instructions would be sent to ${email} (Feature not fully implemented yet)`);
        setError("");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again later."); // Generic error if API call fails
      setMessage("");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="forgot-password-page">
      <h2 className="forgot-title">Forgot Password</h2>
      <p className="forgot-info">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on input change
            placeholder="Enter your registered email"
            disabled={loading} // Disable input while loading
          />
        </div>

        {error && <p className="error-msg">{error}</p>} {/* Display error message */}
        {message && <p className="success-msg">{message}</p>} {/* Display success message */}

        <button type="submit" disabled={loading} className="forgot-btn">
          {loading ? "Sending..." : "Send Reset Link"} {/* Show loading text if API request in progress */}
        </button>
      </form>

      <p className="forgot-link">
        Remember your password? <Link to="/login">Login here</Link> {/* Link to login page */}
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
