import { FiBell, FiCheck, FiArrowLeft, FiEdit3, FiKey } from "react-icons/fi";

import React, { useState, useEffect, useCallback } from 'react';
import './ProfileDashboard.css';
import { fetchAllUsers } from '../api'; 
const API_BASE_URL = "http://localhost:5000";

/* ================= AUTH HOOK ================= */
/**
 * Custom hook to retrieve authenticated user information from local storage.
 */
const useAuth = () => {
    const loggedInUserId = localStorage.getItem('currentUserId');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return {
        userId: loggedInUserId ? parseInt(loggedInUserId) : null,
        currentUser,
        isAuthenticated: !!loggedInUserId
    };
};

/* ================= HELPERS ================= */
/**
 * Helper function to format date strings into 'MM/DD/YYYY' format.
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric' });
    } catch {
        return 'Invalid Date';
    }
};

/**
 * Generates standard authorization headers including the JWT token from local storage.
 */
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
    };
}

/* ================= LANGUAGE (SAMPLE) ================= */
/**
 * Hardcoded language strings for the component.
 */
const languages = {
    en: {
        cancel: "Cancel",
        update_password: "Update Password",
        password_view_title: "Change Password",
        password_too_short: "Password must be at least 6 characters long.",
        passwords_mismatch: "New passwords do not match.",
        personal_info_title: "Personal Information",
        label_email: "Email",
        label_joined: "Date Joined",
        label_location: "Location",
        label_role: "Role",
        label_updated_at: "Last Update",
        password_updated: "Password updated successfully!",
        profile_updated_centered: "Profile Updated Successfully!",
        invalid_email: "Invalid Email Format.",
        edit_profile_title: "Edit Profile Info",
        update_profile: "Update Profile",
        label_fullName: "Full Name",
        confirm_edit_title: "Confirm Profile Update",
        confirm_edit_message: "Are you sure you want to save these changes?",
        save_changes: "Save Changes",
        password_update_failed: "Password update failed.",
        notifications_view: "View Notifications",
        theme: "Theme",
        go_back: "Go Back",
        recent_activity: "Recent Updates",
        empty_notifications: "No new notifications.",
        confirm_new_password: 'Confirm New Password'
    }
};

/* ================= UI SUB-COMPONENTS ================= */
/**
 * Generic component for rendering icons with optional click handler.
 */
const Icon = ({ children, className = '', onClick }) =>
    <span className={`icon ${className}`} onClick={onClick}>{children}</span>;

/**
 * Small, dismissible notification message (Toast) displayed at the bottom of the screen.
 */
const Toast = ({ message, type, onClose }) => {
    if (!message) return null;
    return (
        <div className={`toast ${type}`} dir="ltr">
            <p>{message}</p>
            <button onClick={onClose}>&times;</button>
        </div>
    );
};

/**
 * Large, centered flash message overlay for important confirmations.
 */
const CenteredFlashMessage = ({ message }) => {
    if (!message) return null;
    return (
        <div className="flash-backdrop-center">
            <div className={`flash-message-content`}>
                <p>{message}</p>
            </div>
        </div>
    );
};

/**
 * Generic modal component for showing confirmation dialogs.
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, lang }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-backdrop-center" onClick={onClose}>
            <div className={`confirmation-modal-content`} onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-header-title">{title}</h3>
                <p>{message}</p>
                <div className="confirmation-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>{lang.cancel}</button>
                    <button type="button" className="btn-danger" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

/**
 * Modal form for updating the user's password.
 */
const PasswordModal = ({ isOpen, onClose, lang, updatePassword }) => {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmNewPass, setConfirmNewPass] = useState('');
    const [error, setError] = useState('');

    // Clears form state when the modal closes
    useEffect(() => {
        if (!isOpen) {
            setOldPass(''); setNewPass(''); setConfirmNewPass(''); setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Handles password submission and validation
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (newPass.length < 6) { setError(lang.password_too_short); return; }
        if (newPass !== confirmNewPass) { setError(lang.passwords_mismatch); return; }
        updatePassword(oldPass, newPass);
        onClose();
    };

    return (
        <div className="modal-backdrop-center" onClick={onClose}>
            <div className={`password-modal-content`} onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-header-title">{lang.password_view_title}</h3>
                <form onSubmit={handleSubmit} className="password-form-modal">
                    <input type="password" placeholder={'Current Password'} value={oldPass} onChange={(e) => setOldPass(e.target.value)} required className="form-input" />
                    <input type="password" placeholder={'New Password'} value={newPass} onChange={(e) => setNewPass(e.target.value)} required className="form-input" />
                    <input type="password" placeholder={lang.confirm_new_password} value={confirmNewPass} onChange={(e) => setConfirmNewPass(e.target.value)} required className="form-input" />
                    {error && <p className="form-message error">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>{lang.cancel}</button>
                        <button type="submit" className="btn-primary update-btn">{lang.update_password}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Modal form for editing the user's name and email.
 */
const EditProfileModal = ({ isOpen, onClose, lang, personalInfo, openConfirmation }) => {
    const [editedName, setEditedName] = useState(personalInfo?.Name || '');
    const [editedEmail, setEditedEmail] = useState(personalInfo?.Email || '');
    const [error, setError] = useState('');

    // Initializes form fields when the modal opens
    useEffect(() => {
        if (isOpen && personalInfo) {
            setEditedName(personalInfo.Name || '');
            setEditedEmail(personalInfo.Email || '');
            setError('');
        }
    }, [isOpen, personalInfo]);

    if (!isOpen) return null;

    // Basic email format validation
    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    // Handles form submission, validation, and opens confirmation modal
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!isValidEmail(editedEmail)) {
            setError(lang.invalid_email);
            return;
        }
        openConfirmation({ Name: editedName, Email: editedEmail });
        onClose();
    };

    return (
        <div className="modal-backdrop-center" onClick={onClose}>
            <div className={`password-modal-content`} onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-header-title">{lang.edit_profile_title}</h3>
                <form onSubmit={handleSubmit} className="password-form-modal">
                    <input type="text" placeholder={lang.label_fullName} value={editedName} onChange={(e) => setEditedName(e.target.value)} required className="form-input" />
                    <input type="email" placeholder={lang.label_email} value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} required className="form-input" />
                    {error && <p className="form-message error">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>{lang.cancel}</button>
                        <button type="submit" className="btn-primary update-btn">{lang.update_profile}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ================= MAIN PROFILE COMPONENT ================= */
/**
 * The main component for the user profile dashboard, handling data fetching, state, and view rendering.
 */
const Profile = () => {
    const { userId, currentUser } = useAuth();
    // State for user's personal details
    const [personalInfo, setPersonalInfo] = useState(null);
    // State for user notifications
    const [notifications, setNotifications] = useState([]);
    // State to manage the active view ('profile' or 'notifications')
    const [currentView, setCurrentView] = useState('profile');
    const [currentLang] = useState('en');

    // State for managing various modal open/close states
    const [isClearConfirmModalOpen, setIsClearConfirmModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isProfileConfirmModalOpen, setIsProfileConfirmModalOpen] = useState(false);
    const [pendingProfileUpdate, setPendingProfileUpdate] = useState({});

    // State for toast and flash messages
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('');
    const [flashMessage, setFlashMessage] = useState(null);

    const lang = languages[currentLang];

    // Helper to display a temporary notification message (toast)
    const showToast = useCallback((message, type) => {
        setToastMessage(message);
        setToastType(type || '');
        setTimeout(() => setToastMessage(''), 3000);
    }, []);

    // Helper to display a large, centered flash message
    const showFlashMessage = useCallback((message) => {
        setFlashMessage(message);
        setTimeout(() => setFlashMessage(null), 2500);
    }, []);

    // Navigation and modal control functions
    const openPasswordModal = () => setIsPasswordModalOpen(true);
    const toggleEditProfileModal = () => setIsEditProfileModalOpen(prev => !prev);
    const toggleView = (viewName) => setCurrentView(viewName);

    /* ---------- Fetch user data ---------- */
    /**
     * Fetches the user's detailed profile information from the API.
     */
    const fetchUserData = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, { headers: getAuthHeaders() });
            if (!response.ok) throw new Error('Failed to fetch user data');
            const userData = await response.json();
            // Maps API response to component state structure and formats dates
            setPersonalInfo({
                ...userData,
                User_ID: userData.User_ID,
                Location: userData.Location || 'Cairo, Egypt',
                Date_Joined: userData.Created_At ? formatDate(userData.Created_At) : 'N/A',
                Updated_At: userData.Updated_At ? formatDate(userData.Updated_At) : 'N/A'
            });
        } catch (err) {
            console.error("Error fetching user data:", err);
            showToast("Failed to load user data", 'error');
        }
    }, [userId, showToast]);

    // Initial data fetch on component mount
    useEffect(() => { fetchUserData(); }, [fetchUserData]);

    /* ---------- Fetch notifications ---------- */
    /**
     * Fetches and sorts the current user's notifications.
     */
    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch notifications');
            const all = await res.json();
            // Filters notifications relevant to the user and sorts them by creation date
            const userNotifications = all.filter(n => n.User_ID === parseInt(userId));
            userNotifications.sort((a,b) => new Date(b.Created_At) - new Date(a.Created_At));
            setNotifications(userNotifications);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setNotifications([]);
        }
    }, [userId]);

    // Notification fetch on user ID change
    useEffect(() => { if (userId) fetchNotifications(); }, [userId, fetchNotifications]);

    /**
     * Updates a specific notification's status to 'read' in the API and state.
     */
    const markAsRead = useCallback(async (notificationId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ Is_Read: true })
            });
            if (!res.ok) throw new Error('Failed to mark as read');
            // Optimistically updates the local state
            setNotifications(prev => prev.map(n => n.Notification_ID === notificationId ? { ...n, Is_Read: true } : n));
        } catch (err) {
            console.error("Error marking notification:", err);
        }
    }, []);

    /* ---------- Update password ---------- */
    /**
     * Sends a PUT request to update the user's password and handles state updates.
     */
    const updatePasswordInAPI = useCallback(async (oldPassword, newPassword) => {
        if (!userId || !personalInfo) return;
        try {
            // Sends the new password along with existing profile data
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    User_ID: parseInt(userId),
                    Name: personalInfo.Name,
                    Email: personalInfo.Email,
                    Password: newPassword, // New password for update
                    Role: personalInfo.Role,
                    Created_At: personalInfo.Created_At,
                    Updated_At: new Date().toISOString()
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || 'Password update failed');
            }
            // Updates local state and local storage with the new update time
            setPersonalInfo(prev => ({ ...prev, Updated_At: formatDate(new Date().toISOString()) }));
            const updatedUser = { ...currentUser, Updated_At: formatDate(new Date().toISOString()) };
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            showToast(lang.password_updated, 'success');
        } catch (err) {
            console.error(err);
            showToast(err.message || lang.password_update_failed, 'error');
        }
    }, [userId, personalInfo, currentUser, showToast, lang]);

    /* ---------- Update profile ---------- */
    /**
     * Sends a PUT request to update the user's name and email.
     */
    const handleProfileUpdate = useCallback(async (updatedFields) => {
        if (!userId || !personalInfo) return;
        try {
            // Sends updated name and email along with existing password
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    User_ID: parseInt(userId),
                    Name: updatedFields.Name,
                    Email: updatedFields.Email,
                    Password: personalInfo.Password || 'unchanged', // Password remains unchanged
                    Role: personalInfo.Role,
                    Created_At: personalInfo.Created_At,
                    Updated_At: new Date().toISOString()
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || 'Profile update failed');
            }
            // Updates local state, local storage, and triggers UI refresh events
            setPersonalInfo(prev => ({ ...prev, Name: updatedFields.Name, Email: updatedFields.Email, Updated_At: formatDate(new Date().toISOString()) }));
            const newUserData = { ...currentUser, Name: updatedFields.Name, Email: updatedFields.Email, Updated_At: formatDate(new Date().toISOString()) };
            localStorage.setItem("currentUser", JSON.stringify(newUserData));
            window.dispatchEvent(new CustomEvent('userNameUpdated'));
            showFlashMessage(lang.profile_updated_centered);
        } catch (err) {
            console.error(err);
            showToast(err.message || "Failed to update profile", 'error');
        }
    }, [userId, personalInfo, currentUser, showFlashMessage, showToast, lang]);

    /* ---------- Render helpers ---------- */
    /**
     * Renders the main user profile view with personal info grid and quick actions.
     */
    const renderPersonalInfoView = () => {
        const unreadCount = notifications ? notifications.filter(n => !n.Is_Read).length : 0;
        return (
            <div className="profile-view-content active">
                <div className="personal-info-section">
                    <div className="section-header-with-actions">
                        <h3 className="section-header-title">{personalInfo?.Name}'s {lang.personal_info_title}</h3>
                        <div className="header-actions">
                            {/* Notification Bell with unread badge */}
                            <button className="header-action-btn notification-toggle-btn" onClick={() => toggleView('notifications')} title={lang.notifications_view}>
                                <FiBell />
                                {unreadCount > 0 && <span className="notification-badge-header">{unreadCount}</span>}
                            </button>
                        </div>
                    </div>

                    <div className="info-grid">
                        {/* Information cards */}
                        <div className="info-item-card">
                            <span className="info-label">{lang.label_email}</span>
                            <strong className="info-value">{personalInfo?.Email}</strong>
                        </div>
                        <div className="info-item-card">
                            <span className="info-label">{lang.label_role}</span>
                            <strong className="info-value">{personalInfo?.Role}</strong>
                        </div>
                        <div className="info-item-card">
                            <span className="info-label">{lang.label_location}</span>
                            <strong className="info-value">{personalInfo?.Location}</strong>
                        </div>
                        <div className="info-item-card">
                            <span className="info-label">{lang.label_joined}</span>
                            <strong className="info-value">{personalInfo?.Date_Joined}</strong>
                        </div>
                        <div className="info-item-card">
                            <span className="info-label">{lang.label_updated_at}</span>
                            <strong className="info-value">{personalInfo?.Updated_At}</strong>
                        </div>
                    </div>
                </div>

                <hr className="divider-content" />

                <div className="other-tasks-section">
                    <h3 className="section-header-title">Quick Actions</h3>
                    <div className="quick-actions-grid">
                        {/* Action card to open Edit Profile modal */}
                        <div className="action-card" onClick={() => setIsEditProfileModalOpen(true)}>
                            <FiEdit3 size={24} />
                            <p>Edit Profile</p>
                        </div>
                        {/* Action card to open Change Password modal */}
                        <div className="action-card" onClick={() => setIsPasswordModalOpen(true)}>
                            <FiKey size={24} />
                            <p>{lang.password_view_title}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders the dedicated notifications view.
     */
    const renderDrillDownNotifications = () => (
        <div className="notifications-view-content active">
            <button className="back-to-profile-btn" onClick={() => setCurrentView('profile')}>
                <FiArrowLeft /> {lang.go_back}
            </button>
            <div className="notifications-header-area">
                <h2 className="notifications-title">Recent Activity</h2>
            </div>
            <h3 className="notifications-subtitle">{lang.recent_activity}</h3>
            <div className="notifications-list scrollable-content">
                {notifications && notifications.length > 0 ? (
                    // Renders each notification item
                    notifications.map(notif => (
                        <div
                            key={notif.Notification_ID}
                            className={`notification-item ${!notif.Is_Read ? 'is-new' : 'is-read'}`}
                            onClick={() => { if (!notif.Is_Read) markAsRead(notif.Notification_ID); }}
                        >
                            <span className="notification-icon">
                                {!notif.Is_Read && <span className="item-unread-dot"></span>}
                                {!notif.Is_Read ? <FiBell /> : <FiCheck />}
                            </span>
                            <div>
                                <strong>{notif.Message || lang.recent_activity}</strong>
                                <p>{notif.Created_At ? new Date(notif.Created_At).toLocaleString() : 'Just now'}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="empty-state-message">{lang.empty_notifications}</p>
                )}
            </div>
        </div>
    );

    /* ---------- Loading / Error states: ensure we always render something ---------- */
    // Displays a loading message if profile info is not yet available
    if (!personalInfo) {
        return (
            <div className="dashboard-loading">
                <p>Loading profile...</p>
            </div>
        );
    }

    // Main component render structure
    return (
        <div className={`profile-dashboard-container`}>
            <div className="profile-dashboard-header" />
            <div className="dashboard-main-content">
                <div className="view-container">
                    {/* Switches between profile view and notifications view */}
                    {currentView === 'notifications' ? renderDrillDownNotifications() : renderPersonalInfoView()}
                </div>
            </div>

            {/* Modal Components */}
            <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} lang={lang} updatePassword={updatePasswordInAPI} />
            <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} lang={lang} personalInfo={personalInfo} openConfirmation={(data) => { setPendingProfileUpdate(data); setIsProfileConfirmModalOpen(true); }} />
            <ConfirmationModal isOpen={isProfileConfirmModalOpen} onClose={() => setIsProfileConfirmModalOpen(false)} onConfirm={() => { handleProfileUpdate(pendingProfileUpdate); setIsProfileConfirmModalOpen(false); }} title={lang.confirm_edit_title} message={lang.confirm_edit_message} confirmText={lang.save_changes} lang={lang} />

            {/* Notification Components */}
            <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
            <CenteredFlashMessage message={flashMessage} />
        </div>
    );
};

export default Profile;