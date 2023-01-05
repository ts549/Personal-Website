import React from 'react';
import './Home.css';
import Navbar from '../../components/Navbar/Navbar';
import Overview from '../../components/Overview/Overview';

function Home() {
    return (
        <div>
            <Navbar className="Navbar" />
            <div className="ColorLayer">
                <div className="Introduction">
                    <div className="NameSkillsWrapper">
                        <div className="Name">
                            Hi! My name <br/> is <span>Tao Sun</span>
                        </div>
                        <div className="Skills">
                            <div className="Skill">Java</div>
                            <div className="Skill">Python</div>
                            <div className="Skill">C/C++</div>
                            <div className="Skill">React</div>
                            <div className="Skill">JavaScript</div>
                        </div>
                    </div>
                    <div className="Picture" />
                </div>
                <div className="Overview">
                    <Overview />
                </div>
            </div>
        </div>
    );
}

export default Home;