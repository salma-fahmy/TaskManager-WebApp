import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import "./ProductivityChart.css";

const COLORS = {
  "To-Do": "#f39c12",
  "In Progress": "#2ecc71",
  "Done": "#3498db"
};

const ProductivityChart = ({ data }) => {

  // Tracks component mount state to ensure proper client-side rendering
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Renders placeholder when no data is available
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No tasks to display</p>
      </div>
    );
  }

  // Displays a loading placeholder before the chart initializes
  if (!mounted) {
    return (
      <div className="chart-placeholder">
        <p>Loading chart...</p>
      </div>
    );
  }

  // Renders the productivity pie chart using Recharts
  return (
    <div className="productivity-chart">
      <ResponsiveContainer width="100%" height={420}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={140}
            innerRadius={70}
            paddingAngle={2}
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || "#95a5a6"}
              />
            ))}
          </Pie>

          <Tooltip formatter={(value, name) => [`${value} tasks`, name]} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityChart;
