import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentPosition } from "../APIs/BrowserLocation.js";
import { getCookie, setCookie } from "../utils/cookiesUtils.js";

const LOCATION_PREFERENCE_KEY = "location_preference";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const [userCoordinates, setUserCoordinates] = useState(null);
    const [isLocationPending, setIsLocationPending] = useState(false);

    useEffect(() => {
        if (getCookie(LOCATION_PREFERENCE_KEY) === "true") {
            requestLocation();
        }
    }, []);

    async function requestLocation() {
        setIsLocationPending(true);
        try {
            const coords = await fetchCurrentPosition();
            setUserCoordinates(coords);
            setIsLocationEnabled(true);
        } catch (error) {
            console.error("Location access denied or unavailable:", error);
            setIsLocationEnabled(false);
            setCookie(LOCATION_PREFERENCE_KEY, "false");
        } finally {
            setIsLocationPending(false);
        }
    }

    function toggleLocationTracking(consentGiven) {
        if (consentGiven) {
            setCookie(LOCATION_PREFERENCE_KEY, "true");
            requestLocation();
        } else {
            setCookie(LOCATION_PREFERENCE_KEY, "false");
            setIsLocationEnabled(false);
            setUserCoordinates(null);
        }
    }

    return (
        <LocationContext.Provider value={{ isLocationEnabled, isLocationPending, userCoordinates, toggleLocationTracking }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocationContext() {
    return useContext(LocationContext);
}