import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocationContext } from "./LocationContext.jsx";
import { DEFAULT_AREA_NAME, getAreaName } from "../APIs/Nominatim.jsx";
import { getNearbyVendors, resetVendorCache, hasMovedPastSearchThreshold } from "../APIs/Overpass.jsx";
import { unifiedSearch } from "../APIs/Database.jsx";

const VANCOUVER_COORDINATES = [49.2828, -123.1207];
const DEFAULT_MAP_CENTER = VANCOUVER_COORDINATES;
const DEFAULT_ZOOM = 13;

const HARVEST_MASTER_STORAGE_KEY = "harvestMasterUnlocked";

const DEFAULT_FILTERS = {
    openNow: false,
    confirmedPurchase: false,
};

export const COLLAPSED_DRAWER_HEIGHT = 70;

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
    const [isSearchingLive, setIsSearchingLive] = useState(true);
    const [hasUnlockedHarvestMaster, setHasUnlockedHarvestMaster] = useState(
        () => localStorage.getItem(HARVEST_MASTER_STORAGE_KEY) === "true"
    );

    // ── Search state ─────────────────────────────────────────────────────────
    // searchResult is the full response from /db/search. Everything else is
    // derived from it — no extra state needed.
    const [searchResult, setSearchResult] = useState(null);
    const searchTimerRef = useRef(null);

    // ── Modal state ───────────────────────────────────────────────────────────
    const [receiptModalIsOpen,   setReceiptModalIsOpen]   = useState(false);
    const [receiptModalDefaults, setReceiptModalDefaults] = useState({});
    const [requestModalIsOpen,   setRequestModalIsOpen]   = useState(false);
    const [requestModalDefaults, setRequestModalDefaults] = useState({});

    function openReceiptModal(defaults = {}) {
        setReceiptModalDefaults(defaults);
        setReceiptModalIsOpen(true);
    }

    function openRequestModal(defaults = {}) {
        setRequestModalDefaults(defaults);
        setRequestModalIsOpen(true);
    }

    // ── Derived search values ─────────────────────────────────────────────────

    // Tier 1: vendors with at least one confirmed "found" receipt.
    const confirmedVendorIds = useMemo(() => {
        if (!searchResult?.vendorSightings?.length) return new Set();
        return new Set(
            searchResult.vendorSightings
                .filter(s => s.foundCount > 0)
                .map(s => s.vendorOsmId)
        );
    }, [searchResult]);

    // Tier 2: vendors whose OSM cuisine or shop tags overlap the search tags.
    // vendor.cuisine is a raw OSM string like "chinese;asian" — split on ";".
    // vendor.description is the shop type with spaces ("health food") while
    // osmShopTags uses underscores ("health_food") — normalise before comparing.
    const tagMatchVendorIds = useMemo(() => {
        const cuisineTags = searchResult?.osmCuisineTags ?? [];
        const shopTags    = searchResult?.osmShopTags    ?? [];
        if (!cuisineTags.length && !shopTags.length) return new Set();

        return new Set(
            vendors
                .filter(v => {
                    const vendorCuisines = (v.cuisine ?? "")
                        .toLowerCase().split(";").map(s => s.trim()).filter(Boolean);
                    const vendorShop = (v.description ?? "")
                        .toLowerCase().replaceAll(" ", "_");

                    return cuisineTags.some(t => vendorCuisines.includes(t))
                        || shopTags.some(t => vendorShop.includes(t));
                })
                .map(v => v.id)
        );
    }, [vendors, searchResult]);

    // ── Effects ───────────────────────────────────────────────────────────────

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

    useEffect(() => {
        getAreaName(mapCenter, setAreaName);
    }, [mapCenter]);

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

    // Unified search — debounced 350 ms. One call gets ingredient, OSM tags,
    // and vendor sightings. Clear everything immediately when text is empty.
    useEffect(() => {
        clearTimeout(searchTimerRef.current);

        const trimmed = searchText.trim();
        if (trimmed.length === 0) {
            setSearchResult(null);
            return;
        }

        searchTimerRef.current = setTimeout(async () => {
            try {
                const result = await unifiedSearch(trimmed);
                setSearchResult(result);
            } catch {
                setSearchResult(null);
            }
        }, 350);

        return () => clearTimeout(searchTimerRef.current);
    }, [searchText]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const showSearchAreaButton =
        !isSearchingLive && hasMovedPastSearchThreshold(mapCenter, vendorLookupOptions.radiusMeters);

    function unselectVendor() {
        setSelectedVendor(null);
    }

    function selectVendor(vendor) {
        setSelectedVendor(vendor);
        setFlyTarget([vendor.latitude, vendor.longitude]);
        setIsSearchingLive(false);
    }

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
            mapCenter, setMapCenter,
            mapZoom, setMapZoom,
            flyTarget,
            areaName,
            searchText, setSearchText,
            activeFilters, setActiveFilters,
            vendorLookupOptions, setVendorLookupOptions,
            vendors,
            isLoadingVendors,
            selectedVendor, setSelectedVendor,
            selectVendor, unselectVendor,
            drawerHeight, setDrawerHeight,
            sidebarIsOpen, setSidebarIsOpen,
            isSearchingLive,
            showSearchAreaButton,
            searchCurrentArea,
            hasUnlockedHarvestMaster, unlockHarvestMaster,
            recenterMap,
            // Search
            searchResult,
            confirmedVendorIds,
            tagMatchVendorIds,
            // Modals
            receiptModalIsOpen, setReceiptModalIsOpen, receiptModalDefaults,
            requestModalIsOpen, setRequestModalIsOpen, requestModalDefaults,
            openReceiptModal,
            openRequestModal,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
