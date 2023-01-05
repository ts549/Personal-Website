import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <div className="Navbar">
            <li>
                <Link className="NavElement" to="/AboutMe">About Me</Link>
            </li>
            <li>
                <Link className="NavElement" to="/Experiences">Experiences</Link>
            </li>
            <li>
                <Link className="NavElement" to="/Projects">Projects</Link>
            </li>
            <li>
                <Link className="NavElement" to="/Skills">Skills</Link>
            </li>
            <li id="ContactMe">
                <Link className="NavContact" to="/ContactMe">Contact Me</Link>
            </li>   
        </div>
    );
}

export default Navbar;