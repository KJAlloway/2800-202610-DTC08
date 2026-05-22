import "./Sidebar.css";
import {useState, useRef} from "react";
import {useAuth} from "../../context/AuthContext.jsx";
import {useLocationContext} from "../../context/LocationContext.jsx";
import {useAppContext} from "../../context/AppContext.jsx";
import CabbageIcon from "../../../assets/cabbage.png";

function LocationToggle() {
    const {isLocationEnabled, isLocationPending, toggleLocationTracking} = useLocationContext();

    function handleToggle() {
        toggleLocationTracking(!isLocationEnabled);
    }

    return (
        <div className="location-toggle-container">
            <div className="location-toggle-info">
                <span className="location-toggle-label">Locational Data</span>
                <span className="location-toggle-status">
                    {isLocationPending ? "Locating..." : isLocationEnabled ? "Tracking enabled" : "Tracking disabled"}
                </span>
            </div>

            <button
                className={`location-toggle-btn${isLocationEnabled ? " active" : ""}`}
                onClick={handleToggle}
                disabled={isLocationPending}
                aria-pressed={isLocationEnabled}
                aria-label="Toggle location tracking"
                title={isLocationEnabled ? "Disable Tracking" : "Enable Tracking"}
            >
                <div className="location-toggle-circle"/>
            </button>
        </div>
    );
}

function Sidebar() {
    const {currentUser, setAuthOverlayIsOpen, logout} = useAuth();
    const {sidebarIsOpen, setSidebarIsOpen, hasUnlockedHarvestMaster} = useAppContext();

    const [logoutMessage, setLogoutMessage] = useState("");
    const [logoutFading, setLogoutFading] = useState(false);
    const fadeTimerRef = useRef(null);

    const sidebarClassName = sidebarIsOpen
        ? "sidebar-menu sidebar-menu-is-open"
        : "sidebar-menu";

    function handleLoginClick() {
        setAuthOverlayIsOpen(true);
        setSidebarIsOpen(false);
    }

    async function handleLogoutClick() {
        await logout();
        setLogoutFading(false);
        setLogoutMessage("You've been logged out.");
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = setTimeout(() => {
            setLogoutFading(true);
        }, 1500);
        setSidebarIsOpen(false);
    }

    return (
        <div
            className={sidebarClassName}
            onClick={() => setSidebarIsOpen(false)}
        >
            <aside
                className="sidebar-menu__panel"
                aria-label="App menu"
                onClick={event => event.stopPropagation()}
            >
                <header className="sidebar-menu__header">
                    <img src={CabbageIcon} alt="cabbage" className="sidebar-logo"/>
                    <h2 className="sidebar-menu__title">Cabbage Patch</h2>

                    <button
                        className="sidebar-menu__close-button"
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setSidebarIsOpen(false)}
                    >
                        ×
                    </button>
                </header>

                <div className="sidebar-menu__content">
                    <LocationToggle/>
                    <div className="sidebar-menu__auth">
                        {currentUser ? (
                            <>
                                <p className="sidebar-menu__greeting">
                                    Hello {currentUser.name}, what will we find in the Cabbage Patch today?
                                </p>
                                <button
                                    className="sidebar-menu__auth-button"
                                    type="button"
                                    onClick={handleLogoutClick}
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                {logoutMessage && (
                                    <p
                                        className={`sidebar-menu__logout-message${logoutFading ? " sidebar-menu__logout-message--fading" : ""}`}
                                        onTransitionEnd={() => setLogoutMessage("")}
                                    >
                                        {logoutMessage}
                                    </p>
                                )}
                                <p className="sidebar-menu__greeting">
                                    Not logged in. Log in or create an account to request ingredients and add to the
                                    Cabbage Patch.
                                </p>
                                <button
                                    className="sidebar-menu__auth-button"
                                    type="button"
                                    onClick={handleLoginClick}
                                >
                                    Log in
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <footer className="sidebar-menu__attributions">
                    {hasUnlockedHarvestMaster && (
                        <div className="achievement-badge">
                            🥬 Secret Harvest Master Unlocked
                        </div>
                    )}
                    <span>
                        <a href="https://leafletjs.com/reference.html" target="_blank" rel="noreferrer">Leaflet</a>
                        {" | "}
                        <a href="https://nominatim.org/release-docs/latest/api/Overview/" target="_blank"
                           rel="noreferrer">Nominatim</a>
                    </span>
                    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
                        OpenStreetMap contributors
                    </a>
                    <a href="https://www.flaticon.com/free-icons/cabbage" title="cabbage icons" target="_blank"
                       rel="noreferrer">
                        Cabbage icons created by Freepik - Flaticon
                    </a>
                </footer>
            </aside>
        </div>
    );
}

export default Sidebar;