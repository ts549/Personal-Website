import React from 'react';
import './Side.css';

function Side( { onClick, direction } ) {
    return (
        <div id="Side">
            <div className="Shadow">
                <div id="FirstShadow" />
                <a href="/Home" className={direction + "Side"}>
                    <button className={direction + "Button"} onClick={ onClick }/>
                </a>
            </div>
            <div className={direction + "Case"} />
        </div>
    );
}

export default Side;