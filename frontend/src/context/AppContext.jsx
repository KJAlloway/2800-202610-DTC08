import { createContext, useContext, useEffect, useState } from "react";
import { useLocationContext } from "./LocationContext.jsx";
import { DEFAULT_AREA_NAME, getAreaName } from "../APIs/Nominatim.jsx";
import { getNearbyVendors } from "../APIs/Overpass.jsx";

const VANCOUVER_COORDINATES = [49.2828, -123.1207];
const DEFAULT_MAP_CENTER = VANCOUVER_COORDINATES;

const HARVEST_MASTER_STORAGE_KEY = "harvestMasterUnlocked";

const DEFAULT_FILTERS = {
    openNow: false,
    confirmedPurchase: false
};

const DEFAULT_VENDOR_LOOKUP_OPTIONS = {
    radiusMeters: 1000,
    maxResults: 20
};

export const COLLAPSED_DRAWER_HEIGHT = 70;

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const { isLocationEnabled, userCoordinates } = useLocationContext();

    const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
    const [flyTarget, setFlyTarget] = useState(null);
    const [areaName, setAreaName] = useState(DEFAULT_AREA_NAME);
    const [searchText, setSearchText] = useState("");
    const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);
    const [vendorLookupOptions, setVendorLookupOptions] = useState(DEFAULT_VENDOR_LOOKUP_OPTIONS);
    const [vendors, setVendors] = useState([]);
    const [drawerHeight, setDrawerHeight] = useState(COLLAPSED_DRAWER_HEIGHT);
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
    const [hasUnlockedHarvestMaster, setHasUnlockedHarvestMaster] = useState(
        () => localStorage.getItem(HARVEST_MASTER_STORAGE_KEY) === "true"
    );

    useEffect(() => {
        if (isLocationEnabled && userCoordinates) {
            setFlyTarget(userCoordinates);
        }
    }, [userCoordinates, isLocationEnabled]);

    useEffect(() => {
        getAreaName(mapCenter, setAreaName);
        getNearbyVendors(mapCenter, vendorLookupOptions, setVendors);
    }, [mapCenter, vendorLookupOptions]);

    useEffect(() => {
        console.log("Filters changed:", activeFilters);
    }, [activeFilters]);

    function recenterMap() {
        if (isLocationEnabled && userCoordinates) {
            setFlyTarget([...userCoordinates]);
        } else {
            setFlyTarget([...DEFAULT_MAP_CENTER]);
        }
    }

    function unlockHarvestMaster() {
        localStorage.setItem(HARVEST_MASTER_STORAGE_KEY, "true");
        setHasUnlockedHarvestMaster(true);
    }

    return (
        <AppContext.Provider value={{
            mapCenter,
            setMapCenter,
            flyTarget,
            areaName,
            searchText,
            setSearchText,
            activeFilters,
            setActiveFilters,
            vendorLookupOptions,
            setVendorLookupOptions,
            vendors,
            drawerHeight,
            setDrawerHeight,
            sidebarIsOpen,
            setSidebarIsOpen,
            hasUnlockedHarvestMaster,
            unlockHarvestMaster,
            recenterMap
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}