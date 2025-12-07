import React from "react";
import "./StatisticsCard.css";

const StatisticsCard = ({ title, count, colorClass }) => {
  // Applies dynamic gradient or color styling based on the passed colorClass
  return (
    <div className={`statistics-card ${colorClass}`}>
      {/* Displays the title of the statistic */}
      <h4>{title}</h4>
      {/* Displays the numeric count/value for the statistic */}
      <p>{count}</p>
    </div>
  );
};

export default StatisticsCard;
