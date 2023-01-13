import React from 'react';
import './Projects.css';
import Navbar from '../../components/Navbar/Navbar';
import ProjectBoxes from '../../components/ProjectBoxes/ProjectBoxes';

function Projects() {
    return (
        <div>
            <Navbar className="Navbar" />
            <ProjectBoxes />
        </div>
    );
}

export default Projects;