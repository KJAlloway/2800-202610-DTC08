// import React from 'react';
import './FoodLocationPage.css';
import ScrollableList from '../TemplateScrollableLists/ScrollableList';
import Button from '../TemplateButtons/Button'
import cabbageLogo from '../assets/cabbage-logo.svg';

const FoodLocationPage = ({ onLogout }) => {
    const locations = ["Location #1", "Location #2", "Location #3", "Location #4", "Location #5", "Location #6", "Location #7", "Location #8", "Location #9", "Location #10", "Location #11", "Location #12"];

    return (
        <div className="main-page-wrapper">
            <div className="main-card">
                <div className="main-header">
                    <div className="header-left">
                        <div className="brand-outer-frame">
                            <div className="brand-inner-tray">
                                <img src={cabbageLogo} alt="Logo" className="brand-logo" />
                            </div>
                        </div>
                        <div className="brand-text-outer">
                            <div className="brand-text-tray">
                                <div className="brand-name-stacked">
                                    <span>Cabbage</span>
                                    <span>Patch</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        text="Log out"
                        onClick={onLogout}
                        className="logout-button-override"
                    />
                </div>

                <div className="filter-section">
                    <Button
                        text="Filter"
                        className="filter-button-main"
                        onClick={() => console.log("Filter clicked")}
                    />
                </div>

                <div className="location-list-section">
                    <ScrollableList maxHeight="350px">
                        {locations.map((loc, index) => (
                            <Button
                                key={index}
                                text={loc}
                                className="location-list-button"
                                onClick={() => console.log(`Selected: ${loc}`)}
                            />
                        ))}
                    </ScrollableList>
                </div>

                <div className="main-card-footer">
                    <p>Copyright DTC-08</p>
                    <p>2026</p>
                </div>
            </div>
        </div>
    );
};

export default FoodLocationPage;