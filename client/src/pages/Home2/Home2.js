import React from 'react';
import './Home2.css';
import Navbar from '../../components/Navbar/Navbar';
import { Link } from 'react-router-dom';

function Home2() {
    return (
        <div className="Home2">
            <div id="bgd_wrapper">
                <div className="home_sect" id="first_section">
                    <div className="bgd_1">
                        <div className="blue_triangle" />
                    </div>
                </div>
                <div className="home_sect" id="second_section" />
                <div className="home_sect" id="third_section" />
                <div className="home_sect" id="fourth_section" />
            </div>
            <div id="home_content">
                <div id="home_nav">
                    <li>
                        <Link className="home_nav_e" to="/AboutMe">About Me</Link>
                    </li>
                    <li>
                        <Link className="home_nav_e" to="/Experiences">Experiences</Link>
                    </li>
                    <li>
                        <Link className="home_nav_e" to="/Projects">Projects</Link>
                    </li>
                    <div id="contact_me">
                        <Link id="home_nav_cm" to="/ContactMe">Contact Me</Link>
                    </div>
                </div>
                <div id="intro">
                    <div id="pfp" />
                    <div id="name_skills_wrapper">
                        <div id="name">
                            Hi! My name is <br /><span>Tao Sun</span>
                        </div>
                        <div id="skills">
                            <div className="skill">
                                Java
                            </div>
                            <div className="skill">
                                Python
                            </div>
                            <div className="skill">
                                C
                            </div>
                            <div className="skill">
                                C++
                            </div>
                            <div className="skill">
                                React
                            </div>
                        </div>
                    </div>
                </div>
                <div className="home_pic" />
                <div id="about_me" className="home_desc">
                    <div className="desc_header">
                        About Me
                    </div>
                    <div className="desc_content">
                        I'm a Computer Science student passionate about machine learning 
                        and software engineering!
                    </div>
                </div>
                <div className="home_pic" />
                <div id="experiences" className="home_desc">
                    <div className="desc_header">
                        Experiences
                    </div>
                    <div className="desc_content">
                        I've had the opportunity to experience multiple work settings 
                        such as internships, research positions, clubs, etc.
                    </div>
                </div>
                <div className="home_pic" />
                <div id="projects" className="home_desc">
                    <div className="desc_header">
                        Projects
                    </div>
                    <div className="desc_content">
                        I love working on personal projects, especially involving natural 
                        langauge processing. Please look at some of my work!!
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home2;