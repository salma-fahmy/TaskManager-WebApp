import { useState, useEffect } from 'react';

// Custom hook to retrieve current user's ID and role from localStorage
const useAuth = () => {
    const loggedInUserId = localStorage.getItem('currentUserId'); 
    const userRole = localStorage.getItem('userRole'); // Retrieves user role if stored
    return {
        userId: loggedInUserId,
        userRole: userRole || null,
        isAuthenticated: !!loggedInUserId // Boolean indicating authentication status
    };
};

/**
 * Custom hook to manage user role and authentication state.
 * Provides role information and manager status without fetching from external JSON.
 */
export const useRole = () => {
    const { userId, userRole, isAuthenticated } = useAuth();
    const [role, setRole] = useState(userRole);
    const [isLoadingRole, setIsLoadingRole] = useState(false); 

    // Listen for custom event to update role dynamically if changed in localStorage
    useEffect(() => {
        const handleRoleChange = () => {
            setRole(localStorage.getItem('userRole'));
        };
        window.addEventListener('userRoleUpdated', handleRoleChange);
        return () => {
            window.removeEventListener('userRoleUpdated', handleRoleChange);
        };
    }, []);

    return { 
        userId, 
        userRole: role, 
        isAuthenticated, 
        isLoadingRole, 
        isManager: role === 'Manager' 
    };
};
