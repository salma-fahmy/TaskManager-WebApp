import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import "./WorkloadBarChart.css";

const COLORS = {
  Completed: "#6c5ce7",
  InProgress: "#1dd1a1",
  Overdue: "#ff6b6b"
};

const WorkloadBarChart = ({ data }) => {
  const [mounted, setMounted] = useState(false);

  // Ensures chart renders only after component is mounted (avoids hydration issues)
  useEffect(() => setMounted(true), []);

  // Display placeholder when no data is available
  if (!data || data.length === 0) {
    return <div className="workload-chart-wrapper empty"><p>No team members to display</p></div>;
  }

  // Display loading state until chart is fully mounted
  if (!mounted) {
    return <div className="workload-chart-wrapper empty"><p>Loading chart...</p></div>;
  }

  // Calculate the maximum total tasks for scaling the X-axis
  const maxTotalTasks = data.reduce((max, item) => {
    const total = item.Completed + item.InProgress + item.Overdue;
    return total > max ? total : max;
  }, 0);

  // Generate consecutive ticks from 0 to maxTotalTasks
  const ticks = Array.from({ length: maxTotalTasks + 1 }, (_, i) => i);
  
  // Ensure at least a single tick (0) if no tasks exist
  const finalTicks = maxTotalTasks > 0 ? ticks : [0];

  return (
    <div className="workload-chart-wrapper">
      {/* Responsive container for scaling the bar chart */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          maxBarSize={20} // Limits maximum bar thickness
        >
          {/* Background grid lines */}
          <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
          
          {/* X-axis with fixed domain and consecutive ticks */}
          <XAxis 
            type="number" 
            domain={[0, maxTotalTasks]}
            ticks={finalTicks}
            tickFormatter={(value) => Math.floor(value)} // Display integer values
          />
          
          {/* Y-axis displaying team member names */}
          <YAxis dataKey="name" type="category" width={120} className="chart-yaxis" />

          {/* Tooltip for interactive value display */}
          <Tooltip formatter={(value, name) => [`${value} tasks`, name]} cursor={{ fill: "rgba(0,0,0,0.05)" }} />

          {/* Legend at the top or bottom of chart */}
          <Legend wrapperClassName="chart-legend" />

          {/* Bars for task statuses stacked horizontally */}
          <Bar dataKey="Completed" stackId="a" fill={COLORS.Completed} name="Completed" />
          <Bar dataKey="InProgress" stackId="a" fill={COLORS.InProgress} name="In Progress" />
          <Bar dataKey="Overdue" stackId="a" fill={COLORS.Overdue} name="Overdue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkloadBarChart;
