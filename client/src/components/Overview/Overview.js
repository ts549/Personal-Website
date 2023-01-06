import React from 'react';
import './Overview.css';
import { Link } from 'react-router-dom';

function Overview() {
    return (
        <div>
            <div id="BioSect" className="section">
                <div className="Pic"></div>
                <div className="Text">
                    About Me <br/>
                    My name is Tao Sun and I'm a Junior studying Computer Science as well as Mathematics at Purdue University. I'm <br/> <a href="/AboutMe">Read More...</a>
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
                    Text Text Text Text <br/> <a href="/Experiences">Read More...</a>
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
                    Text Text Text Text <br/> <a href="/Projects">Read More...</a>
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
                    Text Text Text Text <br/> <a href="AboutMe">Read More...</a>
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