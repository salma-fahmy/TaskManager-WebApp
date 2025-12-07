import React from "react";
import { Link } from "react-router-dom";
import "./Projectcard.css";

const ProjectCard = ({ project }) => {
  return (
    // Container card for individual project details
    <div className="project-card">
      {/* Display project title */}
      <h4 className="project-title">{project.Title}</h4>
      
      {/* Display project description */}
      <p className="project-desc">{project.Description}</p>

      {/* Navigation button linking to project details page using the actual Project_ID */}
      <Link to={`/projects/${project.Project_ID}`}>
        <button className="project-btn">View Details</button>
      </Link>
    </div>
  );
};

export default ProjectCard;
