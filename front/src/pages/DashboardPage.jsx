import React, { useEffect, useState } from "react";
import StatisticsCard from "../components/Dashboard/StatisticsCard";
import ProductivityChart from "../components/Dashboard/ProductivityChart";
import TeamMemberPerformance from "../components/Dashboard/TeamMemberPerformance";
import WorkloadBarChart from "../components/Dashboard/WorkloadBarChart";
import { useRole } from "../hooks/useRole";
import { 
    fetchTasksForUser, 
    fetchAllUsers, 
    fetchProjectsForManager, 
    fetchTasksByProjectIds, 
    fetchProjectMembers 
} from "../api";

import "./DashboardPage.css";

// ---------------- Helper Functions ---------------- //

// Process tasks to get counts for Pie Chart
const processTaskData = (tasks) => {
    const statusCounts = tasks.reduce((acc, task) => {
        acc[task.Status] = (acc[task.Status] || 0) + 1;
        return acc;
    }, {});

    return [
        { name: "To-Do", value: statusCounts["To-Do"] || 0 },
        { name: "In Progress", value: statusCounts["In Progress"] || 0 },
        { name: "Done", value: statusCounts["Done"] || 0 },
    ].filter(item => item.value > 0);
};

// Fetch all team members across multiple projects (unique & excluding manager)
const processAllTeamMembers = async (projectIdsToInclude, managerId) => {
    if (!projectIdsToInclude || projectIdsToInclude.length === 0) return [];

    let allMembers = [];
    for (const projectId of projectIdsToInclude) {
        try {
            const members = await fetchProjectMembers(projectId);
            allMembers.push(...members);
        } catch (error) {
            console.error(`Failed to fetch members for project ${projectId}:`, error);
        }
    }

    // Remove duplicates and exclude manager
    const uniqueMemberIds = [...new Set(allMembers.map(m => m.User_ID))];
    return uniqueMemberIds.filter(id => id !== managerId);
};

// Process team performance data for each member (tasks breakdown)
const processTeamPerformanceData = (tasks, users, managerId, memberIDsToInclude) => {
    const today = new Date();

    const teamMembers = users.filter(user => memberIDsToInclude.includes(user.User_ID));

    return teamMembers.map(member => {
        const memberTasks = tasks.filter(task => task.Assigned_To === member.User_ID);
        const completedTasks = memberTasks.filter(t => t.Status === "Done").length;
        const inProgressTasks = memberTasks.filter(t => t.Status === "In Progress").length;
        const overdueTasks = memberTasks.filter(
            t => t.Status !== "Done" && t.Due_Date && new Date(t.Due_Date) < today
        ).length;

        return {
            id: member.User_ID,
            name: member.Name,
            totalTasks: memberTasks.length,
            Completed: completedTasks,
            InProgress: inProgressTasks,
            Overdue: overdueTasks,
            completionRate: memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 100 : 0,
        };
    });
};

// ---------------- DashboardPage Component ---------------- //
const DashboardPage = () => {
    const { isManager, isLoadingRole } = useRole();
    const currentUserId = parseInt(localStorage.getItem("currentUserId"));

    // ---------- State ----------
    const [tasks, setTasks] = useState([]);
    const [teamData, setTeamData] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ---------- Fetch dashboard data ----------
    useEffect(() => {
        if (isLoadingRole) return;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                let tasksData = [];
                let usersData = [];

                if (!isManager) {
                    // Regular user: fetch own tasks
                    if (!currentUserId || isNaN(currentUserId)) throw new Error("Invalid user ID");
                    tasksData = await fetchTasksForUser(currentUserId);
                } else {
                    // Manager: fetch managed projects and related tasks
                    if (!currentUserId || isNaN(currentUserId)) throw new Error("Invalid manager ID");

                    // 1. Get manager projects
                    const managerProjects = await fetchProjectsForManager(currentUserId);
                    setProjects(managerProjects);

                    // 2. Determine project IDs to fetch
                    const projectIdsToFetch = selectedProjectId
                        ? [parseInt(selectedProjectId)]
                        : managerProjects.map(p => p.Project_ID);

                    if (projectIdsToFetch.length === 0) {
                        setTasks([]); setTeamData([]); setLoading(false); return;
                    }

                    // 3. Fetch tasks for these projects
                    tasksData = await fetchTasksByProjectIds(projectIdsToFetch);

                    // 4. Fetch all users
                    usersData = await fetchAllUsers();

                    // 5. Get all unique team member IDs
                    const memberIDsToInclude = await processAllTeamMembers(projectIdsToFetch, currentUserId);

                    // 6. Process performance data
                    const performance = processTeamPerformanceData(tasksData, usersData, currentUserId, memberIDsToInclude);
                    setTeamData(performance);
                }

                setTasks(tasksData);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setError(err.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isLoadingRole, isManager, currentUserId, selectedProjectId]);

    // ---------- Loading & Error States ----------
    if (loading || isLoadingRole) return <div className="dashboard-loading">Loading dashboard...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;

    // ---------- Statistics ----------
    const stats = {
        todo: tasks.filter(t => t.Status === "To-Do").length,
        inProgress: tasks.filter(t => t.Status === "In Progress").length,
        done: tasks.filter(t => t.Status === "Done").length,
    };
    const totalTasks = tasks.length;
    const overdueTasks = tasks.filter(t => t.Status !== "Done" && new Date(t.Due_Date) < new Date()).length;
    const unassignedTasks = tasks.filter(t => !t.Assigned_To).length;

    const chartData = processTaskData(tasks);

    const workloadChartData = teamData.map(m => ({
        name: m.name,
        Completed: m.Completed,
        InProgress: m.InProgress,
        Overdue: m.Overdue,
    }));

    const currentProjectTitle = selectedProjectId 
        ? projects.find(p => p.Project_ID.toString() === selectedProjectId)?.Title 
        : "All Managed Projects";

    const dashboardTitle = isManager 
        ? `Team Performance & Oversight: ${currentProjectTitle}` 
        : `My Productivity Overview`;

    // ---------- Render ----------
    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">{dashboardTitle}</h2>

            {/* Project filter for manager */}
            {isManager && projects.length > 0 && (
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="project-filter">Filter by Project:</label>
                    <select
                        id="project-filter"
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="">All Managed Projects</option>
                        {projects.map(p => (
                            <option key={p.Project_ID} value={p.Project_ID.toString()}>
                                {p.Title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="statistics-cards">
                <StatisticsCard title="Total Tasks" count={totalTasks} />
                <StatisticsCard title="To-Do" count={stats.todo} />
                <StatisticsCard title="In Progress" count={stats.inProgress} />
                <StatisticsCard title="Completed" count={stats.done} />
                {isManager && (
                    <>
                        <StatisticsCard title="Overdue Tasks" count={overdueTasks} />
                        {unassignedTasks > 0 && <StatisticsCard title="Unassigned Tasks" count={unassignedTasks} />}
                    </>
                )}
            </div>

            {/* Charts Section */}
            <div className={`charts-section ${!isManager ? "single-chart" : ""}`}>
                <div className="main-chart">
                    <h3>{isManager ? "Team Workload Distribution" : "Task Status Breakdown"}</h3>
                    {isManager && workloadChartData.length > 0 ? (
                        <WorkloadBarChart data={workloadChartData} />
                    ) : chartData.length > 0 ? (
                        <ProductivityChart data={chartData} />
                    ) : (
                        <div className="no-tasks">No tasks available to display</div>
                    )}
                </div>

                {/* Team performance section for manager */}
                {isManager && (
                    <div className="team-performance-container">
                        <h3>Team Performance</h3>
                        {teamData.length > 0 ? (
                            <div className="team-members-list">
                                {teamData
                                    .sort((a, b) => b.completionRate - a.completionRate) // Sort by completion rate
                                    .map(member => (
                                        <TeamMemberPerformance key={member.id} member={member} />
                                    ))
                                }
                            </div>
                        ) : (
                            <p className="no-team-members">No team members are currently assigned to these projects.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
