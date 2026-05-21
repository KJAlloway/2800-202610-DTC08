import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCookie, setCookie, deleteCookie } from '../utils/cookiesUtils';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const [userCoordinates, setUserCoordinates] = useState(null);

    useEffect(() => {
        const savedPreference = getCookie('location_preference');
        if (savedPreference === 'true') {
            setIsLocationEnabled(true);
            fetchUserLocation();
        } else {
            setIsLocationEnabled(false);
        }
        setIsInitialized(true);
    }, []);

    const fetchUserLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = [position.coords.latitude, position.coords.longitude];
                    setUserCoordinates(coords);
                    console.log("Locational data secured:", coords);
                },
                (error) => {
                    console.error("Location access denied or unavailable:", error);
                    setIsLocationEnabled(false);
                    setCookie('location_preference', 'false');
                }
            );
        }
    };

    const toggleLocationTracking = (consentGiven) => {
        setIsLocationEnabled(consentGiven);
        
        if (consentGiven) {
            setCookie('location_preference', 'true');
            fetchUserLocation();
        } else {
            setCookie('location_preference', 'false');
            setUserCoordinates(null);
        }
    };

    return (
        <LocationContext.Provider value={{ isLocationEnabled, toggleLocationTracking, isInitialized, userCoordinates }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocationContext = () => useContext(LocationContext);