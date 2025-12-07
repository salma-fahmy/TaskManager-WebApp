import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import { fetchAllUsers, createProject, addProjectMember, createNotification } from "../../api";
import "./CreateProjectPage.css";

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const { isManager, isLoadingRole } = useRole();

    // State for project name
    const [name, setName] = useState("");
    // State for project description
    const [description, setDescription] = useState("");
    // Default status is "in progress"
    const [status, setStatus] = useState("in progress"); 
    // State to store selected user IDs for assignment
    const [assignedUsers, setAssignedUsers] = useState([]);
    // State to store all available team members fetched from API
    const [teamMembers, setTeamMembers] = useState([]);
    // State for error messages
    const [error, setError] = useState("");
    // State for loading spinner/message
    const [loading, setLoading] = useState(true);

    // Fetch all users once the role is loaded and user is a manager
    useEffect(() => {
        if (!isLoadingRole && !isManager) return;

        const loadUsers = async () => {
            try {
                const users = await fetchAllUsers();
                setTeamMembers(users);
                setLoading(false);
            } catch (err) {
                setError("Failed to load team members");
                setLoading(false);
            }
        };

        loadUsers();
    }, [isLoadingRole, isManager]);

    // Toggle assignment of a user
    const handleUserToggle = (userId) => {
        setAssignedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    // Handle form submission for creating a project
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Only managers can create projects
        if (!isManager) {
            setError("Access Denied: Only Managers can create projects.");
            return;
        }

        // Check required fields
        if (!name || !description) {
            setError("Please fill in all required fields");
            return;
        }

        setError("");

        try {
            const currentUserId = parseInt(localStorage.getItem("currentUserId"));

            // Validate current user ID
            if (!currentUserId || isNaN(currentUserId) || currentUserId <= 0) {
                throw new Error("Invalid user ID. Please login again.");
            }

            // Prepare payload for creating project
            const projectPayload = {
                Title: name,
                Description: description,
                Start_Date: new Date().toISOString().split("T")[0],
                End_Date: new Date().toISOString().split("T")[0],
                Status: status, 
                Owner_ID: currentUserId
            };

            // Create the project
            const newProject = await createProject(projectPayload);

            // Assign selected users to the project
            if (assignedUsers.length > 0) {
                for (let userId of assignedUsers) {
                    try {
                        await addProjectMember({
                            Project_ID: newProject.Project_ID,
                            User_ID: userId,
                            Role_in_Project: "Developer"
                        });

                        // Send notification to the assigned user
                        await createNotification({
                            User_ID: userId,
                            Message: `You have been added to the project: '${newProject.Title}' by the Manager.`,
                            Type: 'project_assignment',
                            Related_ID: newProject.Project_ID
                        });

                    } catch (err) {
                        console.error(`Failed to add user ${userId}:`, err);
                    }
                }
            }

            alert('Project created successfully!');
            navigate("/projects");

        } catch (err) {
            setError(err.message || "Failed to create project");
        }
    };

    // Show loading message while fetching team members or role
    if (loading || isLoadingRole) {
        return (
            <div className="loading-container">
                <p>Loading team members...</p>
            </div>
        );
    }

    // If user is not a manager, show access denied page
    if (!isManager) {
        return (
            <div className="access-denied-container">
                <h2>Access Denied</h2>
                <p>You do not have permission to create projects.</p>
                <button className="go-dashboard-btn" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="create-project-wrapper">
            <div className="create-project-container">
                <h2 className="page-title">Create New Project</h2>

                {/* Project creation form */}
                <form onSubmit={handleSubmit} className="create-project-form">

                    {/* Project Name */}
                    <div className="form-group">
                        <label>Project Name: <span className="required">*</span></label>
                        <input
                            type="text"
                            className="input-field"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter project name..."
                        />
                    </div>

                    {/* Project Description */}
                    <div className="form-group">
                        <label>Project Description: <span className="required">*</span></label>
                        <textarea
                            className="textarea-field"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your project..."
                        />
                    </div>

                    {/* Assign team members */}
                    <div className="form-group">
                        <label>Assign Team Members:</label>
                        <div className="members-list">
                            {teamMembers.length === 0 ? (
                                <p className="no-members">No team members available</p>
                            ) : (
                                teamMembers.map(user => (
                                    <label
                                        key={user.User_ID}
                                        className={`checkbox-item ${
                                            assignedUsers.includes(user.User_ID) ? "selected" : ""
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={assignedUsers.includes(user.User_ID)}
                                            onChange={() => handleUserToggle(user.User_ID)}
                                        />
                                        <span className="member-name">{user.Name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Display error message if any */}
                    {error && <p className="error-msg">{error}</p>}

                    {/* Form action buttons */}
                    <div className="form-actions">
                        <button type="submit" className="submit-btn">Create Project</button>
                        <button type="button" className="cancel-btn" onClick={() => navigate("/projects")}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectPage;
