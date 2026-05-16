import React from 'react';
import './BackButton.css';
import backArrowIcon from '../assets/backarrow.svg';

const BackButton = ({ onClick }) => {
    return (
        <div className="brand-outer-frame back-nav-frame" onClick={onClick}>
            <div className="brand-inner-tray back-nav-tray">
                <img src={backArrowIcon} alt="Back" className="back-icon-svg" />
            </div>
        </div>
    );
};

export default BackButton;