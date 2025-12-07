// Base URL for all API requests
const API_BASE_URL = "http://localhost:5000";

/* ------------------------- Helper: Get Authorization Headers ------------------------- */
// Returns headers for API requests, including Bearer token if available
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

/* ------------------------- Notifications API ------------------------- */

// Send a notification to a user
export async function createNotification(notificationData) {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to create notification:', errorData?.error || 'Unknown error');
        return { success: false, error: errorData?.error || 'Failed to create notification' };
    }

    return await response.json();
}

/* ------------------------- Authentication API ------------------------- */

// Login user and store authentication details
export async function loginUser(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Invalid login");
    }

    const data = await response.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
            localStorage.setItem("currentUserId", data.user.User_ID);
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            localStorage.setItem("userRole", data.user.Role);
        }
    }

    return data;
}

// Clear all user data from localStorage to logout
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
}

/* ------------------------- Projects API ------------------------- */

// Fetch all projects
export async function fetchAllProjects() {
    const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch all projects");
    return await response.json();
}

// Fetch projects owned by a specific manager
export async function fetchProjectsForManager(userId) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch manager projects");

    const allProjects = await response.json();
    return allProjects.filter(project => project.Owner_ID === userId);
}

// Fetch projects by a list of IDs
export async function fetchProjectsByIds(idsArray) {
    if (!idsArray || idsArray.length === 0) return [];

    const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch projects by IDs");

    const allProjects = await response.json();
    return allProjects.filter(project => idsArray.includes(project.Project_ID));
}

// Fetch a single project by ID
export async function fetchProjectById(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch project");
    return await response.json();
}

// Create a new project
export async function createProject(projectData) {
    console.log('Sending project data:', JSON.stringify(projectData, null, 2));

    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.message || "Failed to create project");
    }

    const result = await response.json();
    console.log('Project created:', JSON.stringify(result, null, 2));
    return result;
}

// Add a member to a project
export async function addProjectMember(memberData) {
    const response = await fetch(`${API_BASE_URL}/projectMembers`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(memberData),
    });

    if (!response.ok) throw new Error("Failed to add project member");
    return await response.json();
}

// Fetch project members by project ID
export async function fetchProjectMembers(projectId) {
    const response = await fetch(`${API_BASE_URL}/projectMembers/project/${projectId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch project members");
    return await response.json();
}

// Fetch memberships of a user across projects
export async function fetchProjectMemberships(userId) {
    const response = await fetch(`${API_BASE_URL}/projectMembers/user/${userId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch memberships");
    return await response.json();
}

// Fetch project owner ID for notifications
export async function fetchProjectOwnerId(projectId) {
    try {
        const project = await fetchProjectById(projectId);
        return project.Owner_ID;
    } catch (error) {
        console.error("Failed to fetch project owner ID:", error);
        return null;
    }
}

/* ------------------------- Tasks API ------------------------- */

// Fetch all tasks
export async function fetchAllTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch tasks");
    return await response.json();
}

// Fetch tasks for a specific project
export async function fetchTasksForProject(projectId) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch tasks");

    const allTasks = await response.json();
    return allTasks.filter(task => task.Project_ID === parseInt(projectId));
}

// Fetch tasks assigned to a specific user
export async function fetchTasksForUser(userId) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch tasks");

    const allTasks = await response.json();
    return allTasks.filter(task => task.Assigned_To === userId);
}

// Fetch tasks by project IDs
export async function fetchTasksByProjectIds(projectIdsArray) {
    if (!projectIdsArray || projectIdsArray.length === 0) return [];

    const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch tasks by project IDs");

    const allTasks = await response.json();
    return allTasks.filter(task => projectIdsArray.includes(task.Project_ID));
}

// Fetch a single task by ID
export async function fetchTaskById(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch task");
    return await response.json();
}

// Create a new task
export async function createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to create task");
    }

    return await response.json();
}

// Update an existing task
export async function updateTask(taskId, taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update task");
    }

    return await response.json();
}

// Delete a task by ID
export async function deleteTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to delete task");
    return await response.json();
}

/* ------------------------- Comments API ------------------------- */

// Fetch comments for a specific task
export async function fetchCommentsForTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/comments`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch comments");

    const allComments = await response.json();
    return allComments.filter(comment => comment.Task_ID === parseInt(taskId));
}

// Create a new comment for a task
export async function createComment(commentData) {
    const response = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(commentData),
    });

    if (!response.ok) throw new Error("Failed to create comment");
    return await response.json();
}

/* ------------------------- Attachments API ------------------------- */

// Fetch attachments for a task
export async function fetchAttachmentsForTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/attachments`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch attachments");

    const allAttachments = await response.json();
    return allAttachments.filter(attachment => attachment.Task_ID === parseInt(taskId));
}

// Create a new attachment
export async function createAttachment(attachmentData) {
    const response = await fetch(`${API_BASE_URL}/attachments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(attachmentData),
    });

    if (!response.ok) throw new Error("Failed to create attachment");
    return await response.json();
}

/* ------------------------- Password Reset API ------------------------- */

// Request a password reset link
export async function requestPasswordReset(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to send reset link");
    }

    return await response.json();
}

// Reset password using token
export async function resetPassword(token, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: newPassword }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to reset password");
    }

    return await response.json();
}

/* ------------------------- User API ------------------------- */

// Check if a user exists by email
export async function checkUserByEmail(email) {
    const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to check user");

    const allUsers = await response.json();
    return allUsers.find(user => user.Email === email);
}

// Fetch all users
export async function fetchAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
}

// Fetch a single user by ID
export async function fetchUserById(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error(`Failed to fetch user with ID: ${userId}`);
    return await response.json();
}
