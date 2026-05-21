import React from 'react';
import { useLocationContext } from '../context/LocationContext';
import './LocationToggle.css';

function LocationToggle() {
    const { isLocationEnabled, toggleLocationTracking } = useLocationContext();

    const handleToggle = () => {
        toggleLocationTracking(!isLocationEnabled);
    };

    return (
        <div className="location-toggle-container">
            <div className="location-toggle-info">
                <span className="location-toggle-label">Locational Data</span>
                <span className="location-toggle-status">
                    {isLocationEnabled ? "Tracking enabled" : "Tracking disabled"}
                </span>
            </div>
            
            <button 
                className={`location-toggle-btn ${isLocationEnabled ? 'active' : ''}`}
                onClick={handleToggle}
                aria-pressed={isLocationEnabled}
                aria-label="Toggle location tracking"
                title={isLocationEnabled ? "Disable Tracking" : "Enable Tracking"}
            >
                <div className="location-toggle-circle"></div>
            </button>
        </div>
    );
}

export default LocationToggle;