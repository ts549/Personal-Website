import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

function Modal() {
    return (
        <Popup trigger={<button className="button"> Open Modal </button>} modal>
            <span> Modal content </span>
        </Popup>
)};

export default Modal;