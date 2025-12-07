import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import {
  fetchTaskById,
  updateTask,
  deleteTask,
  fetchProjectById,
  fetchAllUsers,
  fetchCommentsForTask,
  createComment,
  fetchAttachmentsForTask,
  createAttachment,
  createNotification
} from "../../api";

import "./TaskDetailsPage.css"; 

const TaskDetailsPage = () => {
  // Extract the task ID from the URL parameters
  const { id } = useParams();

  // Navigation hook to programmatically navigate between pages
  const navigate = useNavigate();

  // Get the current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("currentUserId"));

  // Get the user's role information
  const { isManager, isLoadingRole } = useRole();

  // ---------- Component State ----------
  const [task, setTask] = useState(null); // Stores task details
  const [status, setStatus] = useState(""); // Tracks current status of the task
  const [comments, setComments] = useState([]); // Stores comments related to the task
  const [newComment, setNewComment] = useState(""); // Stores input for a new comment
  const [files, setFiles] = useState([]); // Stores attachments of the task
  const [selectedFiles, setSelectedFiles] = useState([]); // Files selected for upload
  const [projectName, setProjectName] = useState(""); // Name of the project the task belongs to
  const [assigneeName, setAssigneeName] = useState(""); // Name of the assigned user
  const [users, setUsers] = useState([]); // List of all users
  const [loading, setLoading] = useState(true); // Loading state while fetching data
  const [error, setError] = useState(""); // Error message state

  // ---------- Fetch Task Details on Component Mount ----------
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        // Fetch the task by its ID
        const taskData = await fetchTaskById(id);
        if (!taskData) throw new Error("Task not found");

        // Restrict access: Non-managers can only view tasks assigned to them
        if (!isManager && taskData.Assigned_To !== currentUserId) {
          setError("Access Denied: Not your assigned task.");
          setLoading(false);
          return;
        }

        // Fetch project info
        const projectData = await fetchProjectById(taskData.Project_ID);

        // Fetch all users (to resolve assignee names)
        const usersData = await fetchAllUsers();
        setUsers(usersData);

        // Get the name of the assigned user
        const assignee = usersData.find(u => u.User_ID === taskData.Assigned_To);

        // Fetch comments and map them with user names
        const commentsData = await fetchCommentsForTask(taskData.Task_ID);
        const mappedComments = commentsData.map(c => {
          const user = usersData.find(u => u.User_ID === c.User_ID);
          return { id: c.Comment_ID, user: user ? user.Name : "Unknown", text: c.Comment_Text };
        });

        // Fetch attachments for this task
        const attachmentsData = await fetchAttachmentsForTask(taskData.Task_ID);

        // Update component state with all fetched data
        setTask(taskData);
        setStatus(taskData.Status || "To-Do");
        setProjectName(projectData ? projectData.Title : "Unknown Project");
        setAssigneeName(assignee ? assignee.Name : "Unassigned");
        setComments(mappedComments);
        setFiles(attachmentsData);
        setLoading(false);
      } catch (err) {
        // Handle fetch errors
        setError(err.message || "Failed to load task");
        setLoading(false);
      }
    };

    // Only fetch data after role is loaded
    if (!isLoadingRole) fetchTaskDetails();
  }, [id, isLoadingRole, isManager, currentUserId]);

  // ---------- Handle Status Change ----------
  const handleStatusChange = async (e) => {
    // Restrict status change to the assigned user
    if (task.Assigned_To !== currentUserId) {
      alert("You can only update status of tasks assigned to you.");
      return;
    }

    const newStatus = e.target.value;
    const oldStatus = task.Status;

    // Optimistically update the UI
    setStatus(newStatus);

    try {
      // Update task status in backend
      await updateTask(task.Task_ID, { Status: newStatus });
      setTask({ ...task, Status: newStatus });

      // Notify manager if someone else updates the task
      const projectData = await fetchProjectById(task.Project_ID);
      const managerId = projectData.Owner_ID;

      if (managerId !== currentUserId) {
        const teamMember = users.find(u => u.User_ID === currentUserId);
        await createNotification({
          User_ID: managerId,
          Message: `${teamMember?.Name} updated task "${task.Title}" from "${oldStatus}" to "${newStatus}".`,
          Type: "task_status_update",
          Related_ID: task.Task_ID
        });
      }

    } catch (err) {
      // Revert status if update fails
      alert(err.message || "Failed to update");
      setStatus(oldStatus);
    }
  };

  // ---------- Handle Adding a Comment ----------
  const handleAddComment = async () => {
    if (!newComment.trim()) return; // Ignore empty comments

    try {
      // Create comment in backend
      const saved = await createComment({
        Comment_Text: newComment,
        Task_ID: task.Task_ID,
        User_ID: currentUserId,
        Created_At: new Date().toISOString(),
      });

      // Get the current user's name
      const user = users.find(u => u.User_ID === currentUserId);

      // Append the new comment to local state
      setComments([...comments, { id: saved.Comment_ID, user: user?.Name, text: newComment }]);
      setNewComment(""); // Reset comment input
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------- Handle File Upload ----------
  const handleUploadFiles = async () => {
    for (let file of selectedFiles) {
      // In a real scenario, replace fakeURL with actual upload logic
      const fakeURL = `http://example.com/${file.name}`;

      try {
        const saved = await createAttachment({
          File_Name: file.name,
          File_URL: fakeURL,
          Task_ID: task.Task_ID
        });

        // Append uploaded file to local state
        setFiles(prev => [...prev, saved]);
      } catch (err) {
        alert(err.message);
      }
    }
    setSelectedFiles([]); // Clear selected files after upload
  };

  // ---------- Handle Task Deletion ----------
  const handleDeleteTask = async () => {
    if (!isManager) return alert("Only managers allowed."); // Restrict deletion to managers

    if (!window.confirm("Delete this task?")) return; // Confirm deletion

    try {
      // Delete the task in backend
      await deleteTask(task.Task_ID);
      navigate(`/projects/${task.Project_ID}`); // Navigate back to project page
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------- Render Loading/Error States ----------
  if (loading) return <p className="loading-text">Loading task...</p>;
  if (error) return <p className="error-text">{error}</p>;

  // ---------- Main Render ----------
  return (
    <div className="task-details-page">

      {/* ---------- Task Info Card ---------- */}
      <div className="task-info-card">
        <h2>{task.Title}</h2>
        <p><strong>Project:</strong> {projectName}</p>
        <p><strong>Assignee:</strong> {assigneeName}</p>
        <p><strong>Priority:</strong> {task.Priority}</p>
        <p><strong>Description:</strong> {task.Description || "No description"}</p>

        <p>
          <strong>Status:</strong>{" "}
          {task.Assigned_To === currentUserId ? (
            // Show dropdown if current user is assignee
            <select value={status} onChange={handleStatusChange} className="status-dropdown">
              <option value="To-Do">To-Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          ) : (
            // Otherwise, show a badge
            <span className="status-badge">{status}</span>
          )}
        </p>

        <p><strong>Due Date:</strong> {task.Due_Date ? new Date(task.Due_Date).toLocaleDateString() : "N/A"}</p>

        {/* ---------- Buttons ---------- */}
        <div className="task-buttons">
          {isManager && (
            <>
              {/* Edit button for managers */}
              <button onClick={() => navigate(`/tasks/${task.Task_ID}/edit`)} className="edit-btn">
                Edit
              </button>

              {/* Delete button for managers */}
              <button onClick={handleDeleteTask} className="delete-btn">
                Delete
              </button>
            </>
          )}
          {/* Back button for everyone */}
          <button onClick={() => navigate(`/projects/${task.Project_ID}`)} className="back-btn">
            Back to Project
          </button>
        </div>
      </div>

      {/* ---------- Comments Section ---------- */}
      <div className="comments-section">
        <h3>Comments</h3>

        {comments.length ? (
          // Display list of comments
          comments.map(c => (
            <div key={c.id} className="comment-item">
              <strong>{c.user}:</strong> {c.text}
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}

        {/* Input for new comment */}
        <textarea
          rows={3}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />

        {/* Add comment button */}
        <button onClick={handleAddComment}>Add Comment</button>
      </div>

      {/* ---------- Attachments Section ---------- */}
      <div className="attachments-section">
        <h3>Attachments</h3>

        {/* File input */}
        <input type="file" multiple onChange={(e) => setSelectedFiles([...e.target.files])} />

        {/* Upload button */}
        <button onClick={handleUploadFiles}>Upload Files</button>

        {/* List of attachments */}
        <ul>
          {files.length ? (
            files.map((f, i) => (
              <li key={i}>
                {f.File_Name} - <a href={f.File_URL} target="_blank" rel="noreferrer">View</a>
              </li>
            ))
          ) : (
            <li>No attachments.</li>
          )}
        </ul>
      </div>

    </div>
  );
};

export default TaskDetailsPage;
