import { createContext, useContext, useEffect, useState } from "react";
import { useLocationContext } from "./LocationContext.jsx";
import { DEFAULT_AREA_NAME, getAreaName } from "../APIs/Nominatim.jsx";
import { getNearbyVendors, resetVendorCache, hasMovedPastSearchThreshold } from "../APIs/Overpass.jsx";

const VANCOUVER_COORDINATES = [49.2828, -123.1207];
const DEFAULT_MAP_CENTER = VANCOUVER_COORDINATES;
const DEFAULT_ZOOM = 13;

const HARVEST_MASTER_STORAGE_KEY = "harvestMasterUnlocked";

const DEFAULT_FILTERS = {
    openNow: false,
    confirmedPurchase: false
};

export const COLLAPSED_DRAWER_HEIGHT = 70;

// Larger radii mean fewer, more meaningful queries. The displacement threshold in
// Overpass.jsx scales with radius, so zooming out naturally requires more movement
// before a re-query fires.
function getRadiusForZoom(zoom) {
    if (zoom >= 16) return 750;
    if (zoom >= 14) return 1500;
    if (zoom >= 12) return 3000;
    if (zoom >= 10) return 7000;
    return 15000;
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const { isLocationEnabled, userCoordinates } = useLocationContext();

    const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
    const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
    const [flyTarget, setFlyTarget] = useState(null);
    const [areaName, setAreaName] = useState(DEFAULT_AREA_NAME);
    const [searchText, setSearchText] = useState("");
    const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);
    const [vendorLookupOptions, setVendorLookupOptions] = useState({
        radiusMeters: getRadiusForZoom(DEFAULT_ZOOM),
        maxResults: 50,
    });
    const [vendors, setVendors] = useState([]);
    const [isLoadingVendors, setIsLoadingVendors] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [drawerHeight, setDrawerHeight] = useState(COLLAPSED_DRAWER_HEIGHT);
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

    // When true, vendor search automatically follows the map center (subject to the
    // displacement threshold in Overpass.jsx). Selecting a vendor locks this to false
    // so results don't jump while the user is looking at a pin. The "Search this area"
    // button re-enables it.
    const [isSearchingLive, setIsSearchingLive] = useState(true);

    const [hasUnlockedHarvestMaster, setHasUnlockedHarvestMaster] = useState(
        () => localStorage.getItem(HARVEST_MASTER_STORAGE_KEY) === "true"
    );

    useEffect(() => {
        if (isLocationEnabled && userCoordinates) {
            setFlyTarget(userCoordinates);
        }
    }, [userCoordinates, isLocationEnabled]);

    useEffect(() => {
        const nextRadius = getRadiusForZoom(mapZoom);
        setVendorLookupOptions(prev =>
            prev.radiusMeters === nextRadius ? prev : { ...prev, radiusMeters: nextRadius }
        );
    }, [mapZoom]);

    // Area name lookup: only needs the center, not vendor options.
    useEffect(() => {
        getAreaName(mapCenter, setAreaName);
    }, [mapCenter]);

    // Vendor search: gated by isSearchingLive. Setting isSearchingLive = true (via
    // searchCurrentArea) also triggers this effect, firing an immediate search.
    useEffect(() => {
        if (!isSearchingLive) return;
        const fetchQueued = getNearbyVendors(mapCenter, vendorLookupOptions, (incoming) => {
            setVendors(incoming);
            setIsLoadingVendors(false);
        });
        if (fetchQueued) {
            setVendors([]);
            setIsLoadingVendors(true);
        }
    }, [mapCenter, vendorLookupOptions, isSearchingLive]);

    useEffect(() => {
        console.log("Filters changed:", activeFilters);
    }, [activeFilters]);

    // Show the "Search this area" button only when live search is off AND the map
    // center has moved far enough that a live search would have fired. This mirrors
    // the exact same displacement check in Overpass.jsx, so the button appears at
    // precisely the moment a live query would otherwise trigger.
    const showSearchAreaButton = !isSearchingLive &&
        hasMovedPastSearchThreshold(mapCenter, vendorLookupOptions.radiusMeters);

    function unselectVendor() {
        setSelectedVendor(null);
    }

    function selectVendor(vendor) {
        setSelectedVendor(vendor);
        setFlyTarget([vendor.latitude, vendor.longitude]);
        setIsSearchingLive(false);
    }

    // Forces a fresh search at the current center regardless of displacement, then
    // re-enables live tracking so subsequent panning auto-updates as normal.
    function searchCurrentArea() {
        resetVendorCache();
        setSelectedVendor(null);
        setIsSearchingLive(true);
    }

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
            mapZoom,
            setMapZoom,
            flyTarget,
            areaName,
            searchText,
            setSearchText,
            activeFilters,
            setActiveFilters,
            vendorLookupOptions,
            setVendorLookupOptions,
            vendors,
            isLoadingVendors,
            selectedVendor,
            setSelectedVendor,
            selectVendor,
            unselectVendor,
            drawerHeight,
            setDrawerHeight,
            sidebarIsOpen,
            setSidebarIsOpen,
            isSearchingLive,
            showSearchAreaButton,
            searchCurrentArea,
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