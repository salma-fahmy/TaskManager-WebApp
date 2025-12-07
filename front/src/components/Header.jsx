import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; 
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Guest");

  // Function to update the displayed username from localStorage
  const updateUserName = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.Name) {
      setUserName(currentUser.Name);
    } else {
      setUserName("Guest");
    }
  };

  useEffect(() => {
    // Initialize username on component mount
    updateUserName();

    // Handle changes in localStorage to update username dynamically
    const handleStorageChange = (e) => {
      if (e.key === "currentUser") updateUserName();
    };

    // Listen to custom event in case username is updated programmatically
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userNameUpdated", updateUserName);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userNameUpdated", updateUserName);
    };
  }, []);

  return (
    // Main header container
    <header className="main-header">
      {/* Left side placeholder for potential additional elements */}
      <div></div> 

      {/* User info section with clickable navigation to profile page */}
      <div className="header-user" onClick={() => navigate("/profile")}>
        <span className="header-username">{userName}</span>
        <FaUserCircle className="header-user-icon" />
      </div>
    </header>
  );
};

export default Header;
