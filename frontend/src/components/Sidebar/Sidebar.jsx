import "./Sidebar.css";
import LocationToggle from '../LocationToggle/LocationToggle';
import { useAuth } from "../Auth/Auth.jsx";
import { useState, useRef } from "react";

function Sidebar({ isOpen, onClose, hasUnlockedHarvestMaster }) {
    const { currentUser, setAuthOverlayIsOpen, logout } = useAuth();

    const [logoutMessage, setLogoutMessage] = useState("");
    const [logoutFading, setLogoutFading] = useState(false);
    const fadeTimerRef = useRef(null);

    const sidebarClassName = isOpen
        ? "sidebar-menu sidebar-menu-is-open"
        : "sidebar-menu";

    function handleOverlayClick() {
        onClose();
    }

    function handlePanelClick(event) {
        event.stopPropagation();
    }

    function handleLoginClick() {
        setAuthOverlayIsOpen(true);
        onClose();
    }

    async function handleLogoutClick() {
        await logout();
        setLogoutFading(false);
        setLogoutMessage("You've been logged out.");
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = setTimeout(() => {
            setLogoutFading(true);
        }, 1500);
        onClose();
    }

    return (
        <div
            className={sidebarClassName}
            onClick={handleOverlayClick}
        >
            <aside
                className="sidebar-menu__panel"
                aria-label="App menu"
                onClick={handlePanelClick}
            >
                <header className="sidebar-menu__header">
                    <img src="../assets/cabbage.png" alt="cabbage" className="sidebar-logo" />
                    <h2 className="sidebar-menu__title">Cabbage Patch</h2>

                    <button
                        className="sidebar-menu__close-button"
                        type="button"
                        aria-label="Close menu"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>

                <div className="sidebar-menu__content">
                    <LocationToggle />
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
                                    Not logged in. Log in or create an account to request ingredients and add to the Cabbage Patch.
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
                    <span>
                        <a href="https://leafletjs.com/reference.html" target="_blank" rel="noreferrer">Leaflet</a>
                        {" | "}
                        <a href="https://nominatim.org/release-docs/latest/api/Overview/" target="_blank" rel="noreferrer">Nominatim</a>
                    </span>
                    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
                    <span>
                        {hasUnlockedHarvestMaster && (
                            <div className="achievement-badge">
                                🥬 Secret Harvest Master Unlocked
                            </div>
                        )}
                        <a
                            href="https://leafletjs.com/reference.html"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Leaflet
                        </a>
                        {" | "}
                        <a
                            href="https://nominatim.org/release-docs/latest/api/Overview/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Nominatim
                        </a>
                    </span>
                    <a
                        href="https://www.openstreetmap.org/copyright"
                        target="_blank"
                        rel="noreferrer"
                    >
                        OpenStreetMap contributors
                    </a>
                    <a href="https://www.flaticon.com/free-icons/cabbage" title="cabbage icons" target="_blank" rel="noreferrer">
                        Cabbage icons created by Freepik - Flaticon
                    </a>
                </footer>
            </aside>
        </div>
    );
}

export default Sidebar;