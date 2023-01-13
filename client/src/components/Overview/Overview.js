import React from 'react';
import './Overview.css';
import { Link } from 'react-router-dom';

function Overview() {
    return (
        <div>
            <div id="BioSect" className="section">
                <div className="Pic"></div>
                <div className="Text">
                    I'm a Computer Science student passionate about machine learning 
                    and software engineering!
                </div>
                <div className="ShadowCover">
                    <span className="ShadowText">About Me</span>
                    <a href="/AboutMe" className="arrow_wrapper">
                        <button className="arrow" />
                    </a>
                </div>
            </div>
            <div id="ExpSect" className="section">
                <div className="Text">
                    I've had the opportunity to experience multiple work settings 
                    such as internships, research positions, clubs, etc.
                </div>
                <div className="Pic"></div>
                <div className="ShadowCover">
                    <span className="ShadowText">Experiences</span>
                    <a href="/Experiences" className="arrow_wrapper">
                        <button className="arrow" />
                    </a>
                </div>
            </div>
            <div id="ProjSect" className="section">
                <div className="Pic"></div>
                <div className="Text">
                    I love working on personal projects, especially involving natural 
                    langauge processing. Please look at some of my work!!
                </div>
                <div className="ShadowCover">
                    <span className="ShadowText">Projects</span>
                    <a href="/Projects" className="arrow_wrapper">
                        <button className="arrow" />
                    </a>
                </div>
            </div>
            <div id="SkillsSect" className="section">
                <div className="Text">
                    I've had experience with multiple languages, frameworks, technologies, etc.
                </div>
                <div className="Pic"></div>
                <div className="ShadowCover">
                    <span className="ShadowText">Skills</span>
                    <a href="/Skills" className="arrow_wrapper">
                        <button className="arrow" />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Overview;