import "./Sidebar.css";
import LocationToggle from '../LocationToggle/LocationToggle';

function Sidebar({ isOpen, onClose }) {
    const sidebarClassName = isOpen
        ? "sidebar-menu sidebar-menu-is-open"
        : "sidebar-menu";

    function handleOverlayClick() {
        onClose();
    }

    function handlePanelClick(event) {
        event.stopPropagation();
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
                </div>

                <footer className="sidebar-menu__attributions">
                    <span>
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

                    <a
                        href="https://www.flaticon.com/free-icons/cabbage"
                        title="cabbage icons"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Cabbage icons created by Freepik - Flaticon
                    </a>
                </footer>
            </aside>
        </div>
    );
}

export default Sidebar;