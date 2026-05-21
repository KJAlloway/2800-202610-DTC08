import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCookie, setCookie, deleteCookie } from '../utils/cookiesUtils';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const savedPreference = getCookie('location_preference');
        if (savedPreference === 'true') {
            setIsLocationEnabled(true);
        } else {
            setIsLocationEnabled(false);
        }
        setIsInitialized(true);
    }, []);

    const toggleLocationTracking = (consentGiven) => {
        setIsLocationEnabled(consentGiven);
        
        if (consentGiven) {
            setCookie('location_preference', 'true');
        } else {
            setCookie('location_preference', 'false');
        }
    };

    return (
        <LocationContext.Provider value={{ isLocationEnabled, toggleLocationTracking, isInitialized }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocationContext = () => useContext(LocationContext);