import "./App.css";
import { useEffect } from "react";

import Map from "../Map/Map.jsx";
import SearchBar from "../SearchBar/SearchBar.jsx";
import ResultsDrawer from "../ResultsDrawer/ResultsDrawer.jsx";
import Sidebar from "../Sidebar/Sidebar.jsx";
import RecenterIcon from "../../../assets/recenter-icon.svg";
import { AuthOverlay } from "../Auth/AuthOverlay.jsx";
import EasterEggCredits, { useEasterEgg } from "../EasterEggCredits/EasterEggCredits.jsx";
import { useMediaQuery, DESKTOP_BREAKPOINT } from "../../hooks/useMediaQuery.js";
import { useAppContext } from "../../context/AppContext.jsx";

function App() {
    const { searchText, recenterMap, drawerHeight } = useAppContext();
    const { showEasterEgg, triggerIfMatch } = useEasterEgg();
    const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);

    const recenterBottom = isDesktop
        ? 20
        : Math.min(drawerHeight, window.innerHeight * 0.5);

    useEffect(() => {
        triggerIfMatch(searchText);
        console.log("Search text changed:", searchText);
    }, [searchText]);

    return (
        <main className="App">
            <Map />

            <section className="map-overlay" aria-label="Map search controls">
                <SearchBar />
            </section>

            <button
                className="map-overlay__recenter-button"
                type="button"
                onClick={recenterMap}
                aria-label="Recenter map"
                title="Recenter Map"
                style={{ bottom: `${recenterBottom + 12}px` }}
            >
                <img
                    src={RecenterIcon}
                    alt="Recenter icon"
                    className="recenter-icon"
                />
            </button>

            <Sidebar />
            <AuthOverlay />
            <ResultsDrawer />

            {showEasterEgg && <EasterEggCredits />}
        </main>
    );
}

export default App;