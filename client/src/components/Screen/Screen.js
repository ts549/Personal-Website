import React from 'react';
import './Screen.css';

function Screen( {direction} ) {
    return (
        <div className={direction + "Screen"}>
            Screen
        </div>
    );
}

export default Screen;