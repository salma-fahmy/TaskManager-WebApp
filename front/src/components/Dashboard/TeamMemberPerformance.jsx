import React from 'react';
import './TeamMemberPerformance.css';

const TeamMemberPerformance = ({ member, index }) => {
    // Determine the display name for the team member with fallback options
    const memberDisplayName = member.name 
        || member.FullName 
        || `${member.First_Name || ""} ${member.Last_Name || ""}`.trim();

    return (
        // Card container for individual team member performance
        <div className={`team-member-card card-${index}`}>
            {/* Display the team member's name */}
            <h4 className="member-name">{memberDisplayName || "N/A"}</h4> 
            
            {/* Shows task statistics: Total and In Progress */}
            <div className="task-stats">
                <p>Total Tasks: <strong className="total-tasks">{member.totalTasks || 0}</strong></p>
                <p>In Progress: <strong className="in-progress">{member.InProgress || 0}</strong></p>
            </div>

            {/* Shows task statistics: Completed and Overdue */}
            <div className="task-stats">
                <p>Completed: <span className="completed">{member.Completed || 0}</span></p>
                <p>Overdue: <span className="overdue">{member.Overdue || 0}</span></p>
            </div>

            {/* Displays completion rate with a progress bar */}
            <div className="completion-rate-container">
                <p>Completion Rate: <span className="completion-rate">
                    {(member.completionRate || 0).toFixed(1)}%
                </span></p>

                {/* Visual representation of completion rate */}
                <div className="completion-bar">
                    <div 
                        className="completion-fill" 
                        style={{ width: `${member.completionRate || 0}%` }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default TeamMemberPerformance;
