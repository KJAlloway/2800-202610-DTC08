import "./App.css";
import { useEffect, useState } from "react";

import Map from "../Map/Map.jsx";
import SearchBar from "../SearchBar/SearchBar.jsx";
import ResultsDrawer from "../ResultsDrawer/ResultsDrawer.jsx";
import Sidebar from "../Sidebar/Sidebar.jsx";

import {DEFAULT_AREA_NAME, getAreaName} from "../APIs/Nominatim.jsx";
import {getNearbyVendors} from "../APIs/Overpass.jsx";

import EasterEggCredits from "../EasterEggCredits/EasterEggCredits.jsx";
import RecenterIcon from "../../../assets/recenter-icon.svg";

import secretSound from "../../../assets/sounds/universfield-video-game-bonus-323603.mp3";
import backgroundLoop from "../../../assets/sounds/freesound_community-8-bit-heaven-26287.mp3"
import { useLocationContext } from "../context/LocationContext.jsx";

const VANCOUVER_MAP_CENTER = [49.2828, -123.1207];

const DEFAULT_FILTERS = {
    openNow: false,
    confirmedPurchase: false
};

const DEFAULT_VENDOR_LOOKUP_OPTIONS = {
    radiusMeters: 1000,
    maxResults: 20
};

function App() {
    const { isLocationEnabled, userCoordinates } = useLocationContext();
    const [mapCenter, setMapCenter] = useState(() => {
        return userCoordinates ? userCoordinates : VANCOUVER_MAP_CENTER;
    });
    const [areaName, setAreaName] = useState(DEFAULT_AREA_NAME);
    const [searchText, setSearchText] = useState("");
    const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);
    const [vendorLookupOptions, setVendorLookupOptions] = useState(DEFAULT_VENDOR_LOOKUP_OPTIONS);
    const [vendors, setVendors] = useState([]);
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [hasUnlockedHarvestMaster, setHasUnlockedHarvestMaster] = useState(false);

    const handleRecenter = () => {
        if (isLocationEnabled && userCoordinates) {
            setMapCenter([...userCoordinates]);
        } else {
            setMapCenter([...VANCOUVER_MAP_CENTER]);
        }
    };

    useEffect(() => {
        if (isLocationEnabled && userCoordinates) {
            setMapCenter(userCoordinates);
        }
    }, [userCoordinates, isLocationEnabled]);

    useEffect(() => {
        if (!isLocationEnabled) {
            console.log("Locational data is turned off.");
            return;
        }

        const currentKnownAreaName = getAreaName(mapCenter, setAreaName);

        const currentKnownVendors = getNearbyVendors(
            mapCenter,
            vendorLookupOptions,
            setVendors
        );

        setAreaName(currentKnownAreaName);
        setVendors(currentKnownVendors);
    }, [mapCenter, vendorLookupOptions, isLocationEnabled]);

    useEffect(() => {
        /*
         * Later:
         * - submit ingredient search
         * - ask backend for matching vendors
         * - prepare autocomplete/suggestion state if we choose to track typing
         */

        // Easter egg trigger
        if (searchText.trim().toLowerCase() === "cabbage patch") {

            localStorage.setItem("harvestMasterUnlocked", "true");
            setHasUnlockedHarvestMaster(true);
            const easterEggAudio = new Audio(secretSound);
            const backgroundMusic = new Audio(backgroundLoop);
            backgroundMusic.loop = true;
            backgroundMusic.volume = 0.3;

            easterEggAudio.play();

            setTimeout(() => {
                backgroundMusic.play();
            }, 2500);


            console.log("Play animation")
            setShowEasterEgg(true);

            // Easter egg end timer
            setTimeout(() => {
                console.log("Animation end")
                setShowEasterEgg(false);

                backgroundMusic.pause();
                backgroundMusic.currentTime = 0;

            }, 13500)
        }

        console.log("Search text changed:", searchText);
    }, [searchText]);

    useEffect(() => {
        /*
         * Later:
         * - refilter vendors
         * - update drawer results
         * - update map marker visibility
         */

        console.log("Filters changed:", activeFilters);
    }, [activeFilters]);

    // Checks if secret achievement was unlocked before
    useEffect(() => {

        const achievementUnlocked =
            localStorage.getItem("harvestMasterUnlocked");

        if (achievementUnlocked === "true") {
            setHasUnlockedHarvestMaster(true);
        }

    }, []);

    return (
        <main className="App">
            <Map
                initialCenter={mapCenter}
                onCenterChange={setMapCenter}
            />

            <section className="map-overlay" aria-label="Map search controls">
                <SearchBar
                    onSearch={setSearchText}
                    onMenuButtonClick={() => setSidebarIsOpen(true)}
                />

                <button
                    className="map-overlay__recenter-button"
                    type="button"
                    onClick={handleRecenter}
                    aria-label="Recenter map"
                    title="Recenter Map"
                >
                    <img
                        src={RecenterIcon}
                        alt="Recenter icon"
                        className="recenter-icon"
                    />
                </button>

            </section>

            <Sidebar
                isOpen={sidebarIsOpen}
                onClose={() => setSidebarIsOpen(false)}
                hasUnlockedHarvestMaster={hasUnlockedHarvestMaster}
            />

            <ResultsDrawer
                searchedText={searchText}
                areaName={areaName}
                vendors={vendors}
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
            />
            {showEasterEgg && <EasterEggCredits />}
        </main>
    );
}

export default App;