import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import {
    createTask,
    updateTask,
    fetchTaskById,
    fetchAllUsers,
    fetchProjectMembers,
    fetchAllProjects,
    createNotification,
    fetchProjectOwnerId 
} from "../../api";
import "./TaskFormPage.css";

const TaskFormPage = () => {
    // Navigation hook to programmatically redirect user
    const navigate = useNavigate();

    // Extract task ID and optional projectId from URL parameters
    const { id, projectId: projectIdParam } = useParams();

    // Get user role info (isManager) and loading state
    const { isManager, isLoadingRole } = useRole();

    // Determine if the page is in edit mode (based on presence of task ID)
    const isEditMode = !!id;

    // ---------- Form State ----------
    const [title, setTitle] = useState(""); // Task title
    const [description, setDescription] = useState(""); // Task description
    const [projectId, setProjectId] = useState(projectIdParam || ""); // Selected project
    const [assigneeId, setAssigneeId] = useState(""); // Selected assignee
    const [priority, setPriority] = useState("Normal"); // Task priority
    const [status, setStatus] = useState("To-Do"); // Task status (only editable in edit mode)
    const [dueDate, setDueDate] = useState(""); // Due date

    const [projects, setProjects] = useState([]); // List of all projects
    const [projectMembers, setProjectMembers] = useState([]); // Members of selected project
    const [error, setError] = useState(""); // Error messages for form validation
    const [loading, setLoading] = useState(true); // Loading state
    const [originalTask, setOriginalTask] = useState(null); // Store original task data for comparison in edit mode

    // ---------- Load Projects and Task Data on Mount ----------
    useEffect(() => {
        // If role is loading or user is not a manager, stop loading
        if (isLoadingRole || !isManager) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                // Fetch all projects to populate project dropdown
                const allProjects = await fetchAllProjects();
                setProjects(allProjects);

                // If in edit mode, fetch existing task details
                if (isEditMode) {
                    const taskData = await fetchTaskById(id);
                    if (!taskData) throw new Error("Task not found");

                    setOriginalTask(taskData);

                    // Populate form fields with existing task data
                    setTitle(taskData.Title || "");
                    setDescription(taskData.Description || "");
                    setProjectId(taskData.Project_ID?.toString() || "");
                    setAssigneeId(taskData.Assigned_To?.toString() || "");
                    setPriority(taskData.Priority || "Normal");
                    setStatus(taskData.Status || "To-Do");
                    setDueDate(taskData.Due_Date ? taskData.Due_Date.split("T")[0] : "");

                    // Fetch project members if project is selected
                    if (taskData.Project_ID) {
                        const members = await fetchProjectMembers(taskData.Project_ID);
                        const users = await fetchAllUsers();
                        const membersWithDetails = members.map(m => {
                            const user = users.find(u => u.User_ID === m.User_ID);
                            return { User_ID: m.User_ID, Name: user ? user.Name : "Unknown" };
                        });
                        setProjectMembers(membersWithDetails);
                    }
                } 
                // If creating a new task with projectId in URL
                else if (projectIdParam) {
                    setProjectId(projectIdParam);

                    const members = await fetchProjectMembers(projectIdParam);
                    const users = await fetchAllUsers();
                    const membersWithDetails = members.map(m => {
                        const user = users.find(u => u.User_ID === m.User_ID);
                        return { User_ID: m.User_ID, Name: user ? user.Name : "Unknown" };
                    });
                    setProjectMembers(membersWithDetails);
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load data");
                setLoading(false);
            }
        };

        loadData();
    }, [id, projectIdParam, isManager, isLoadingRole, isEditMode]);

    // ---------- Load Project Members when Project Changes ----------
    useEffect(() => {
        const loadMembers = async () => {
            if (projectId) {
                try {
                    const members = await fetchProjectMembers(parseInt(projectId));
                    const users = await fetchAllUsers();
                    const membersWithDetails = members.map(m => {
                        const user = users.find(u => u.User_ID === m.User_ID);
                        return { User_ID: m.User_ID, Name: user ? user.Name : "Unknown" };
                    });
                    setProjectMembers(membersWithDetails);
                } catch (e) {
                    console.error("Failed to load project members:", e);
                    setProjectMembers([]);
                }
            }
        };
        loadMembers();
    }, [projectId]);

    // ---------- Handle Form Submission ----------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Restrict access to managers
        if (!isManager) {
            setError("Access Denied: Only Managers can create/edit tasks.");
            return;
        }

        // Validate required fields
        if (!title.trim()) return setError("Title is required");
        if (!projectId) return setError("Project must be selected");
        if (!assigneeId) return setError("Assignee must be selected");
        if (!dueDate) return setError("Due date must be set");

        setError("");

        // Prepare task data object
        const taskData = {
            Title: title,
            Description: description,
            Project_ID: parseInt(projectId),
            Assigned_To: parseInt(assigneeId),
            Priority: priority,
            Status: isEditMode ? status : "To-Do",
            Due_Date: dueDate,
        };
        
        // Get current manager's name for notifications
        const currentUserName = JSON.parse(localStorage.getItem('currentUser'))?.Name || 'Manager';

        try {
            if (isEditMode) {
                // Update existing task
                await updateTask(id, taskData);

                // Notify project owner if status changed
                if (originalTask && originalTask.Status !== taskData.Status) {
                    const projectOwnerId = await fetchProjectOwnerId(taskData.Project_ID);
                    if (projectOwnerId) {
                        await createNotification({
                            User_ID: projectOwnerId,
                            Message: `Task status changed: '${taskData.Title}' is now ${taskData.Status}.`,
                            Type: 'status_update',
                            Related_ID: parseInt(id)
                        });
                    }
                }

                // Notify new assignee if assignment changed
                if (originalTask && originalTask.Assigned_To !== taskData.Assigned_To) {
                    const newAssigneeName = projectMembers.find(m => m.User_ID === taskData.Assigned_To)?.Name || 'Team Member';
                    await createNotification({
                        User_ID: taskData.Assigned_To,
                        Message: `You are now assigned to task: '${taskData.Title}' by ${currentUserName}.`,
                        Type: 'assignment_change',
                        Related_ID: parseInt(id)
                    });
                }
            } else {
                // Create new task
                const newTask = await createTask(taskData);

                // Notify the assignee
                await createNotification({
                    User_ID: taskData.Assigned_To,
                    Message: `New task assigned: '${taskData.Title}' by ${currentUserName}.`,
                    Type: 'new_task_assignment',
                    Related_ID: newTask.Task_ID 
                });
            }

            // Navigate back to project page after save
            navigate(`/projects/${projectId}`);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to save task");
        }
    };

    // ---------- Handle Loading and Access Control ----------
    if (loading || isLoadingRole) return <p>Loading...</p>;
    if (!isManager) return <Navigate to="/dashboard" replace />; // Redirect non-managers

    // ---------- Render Form ----------
    return (
        <div className="task-form-page">
            <h2>{isEditMode ? "Edit Task" : "Create New Task"}</h2>

            <form onSubmit={handleSubmit}>
                {/* Title Input */}
                <div>
                    <label>Title: *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* Description Input */}
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                    />
                </div>

                {/* Project Dropdown */}
                <div>
                    <label>Project: *</label>
                    <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        required
                    >
                        <option value="">-- Select Project --</option>
                        {projects.map(p => (
                            <option key={p.Project_ID} value={p.Project_ID.toString()}>
                                {p.Title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Assignee Dropdown */}
                <div>
                    <label>Assign To: *</label>
                    <select
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        required
                    >
                        <option value="">-- Select Team Member --</option>
                        {projectMembers.map(member => (
                            <option key={member.User_ID} value={member.User_ID.toString()}>
                                {member.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Due Date Input */}
                <div>
                    <label>Due Date: *</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                    />
                </div>

                {/* Priority Dropdown */}
                <div>
                    <label>Priority:</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                    </select>
                </div>

                {/* Status Dropdown (only in edit mode) */}
                {isEditMode && (
                    <div>
                        <label>Status:</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="To-Do">To-Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                )}

                {/* Display any errors */}
                {error && <p className="error-message">{error}</p>}

                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit">{isEditMode ? "Update Task" : "Create Task"}</button>
                    <button
                        type="button"
                        onClick={() => navigate(`/projects/${projectId}`)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskFormPage;
