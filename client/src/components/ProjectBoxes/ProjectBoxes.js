import React from 'react';
import './ProjectBoxes.css';
import Modal from '../Modal/Modal';

function ProjectBoxes() {
    return (
        <div>
            <div className="ProjectBoxes">
                <div className="ProjectBox" />
                <div className="ProjectBox" />
                <div className="ProjectBox" />
                <div className="ProjectBox" />
            </div>
            <div className="ShadowBoxes">
                <div className="ShadowBox" />
                <div className="ShadowBox" />
                <div className="ShadowBox" />
                <div className="ShadowBox" />
            </div>
            <Modal />
        </div>
    );
}

export default ProjectBoxes;