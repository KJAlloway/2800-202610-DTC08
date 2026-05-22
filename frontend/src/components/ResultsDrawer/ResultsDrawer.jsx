import { useEffect, useRef, useState } from "react";
import { clamp, toTitleCase } from "../../utils/HelperFunctions.js";
import "./ResultsDrawer.css";
import { useAppContext } from "../../context/AppContext.jsx";
import { COLLAPSED_DRAWER_HEIGHT } from "../../context/AppContext.jsx";
import { useMediaQuery, DESKTOP_BREAKPOINT } from "../../hooks/useMediaQuery.js";

const DEFAULT_DRAWER_HEIGHT = 360;
const MAX_DRAWER_HEIGHT_RATIO = 0.85;

function OpenInGoogleMapsButton({ vendorName, vendorAddress }) {
    const [isActive, setIsActive] = useState(false);

    function buildGoogleMapsUrl() {
        const placeInfo = encodeURIComponent(vendorName + " " + vendorAddress);
        return `https://www.google.com/maps/search/?api=1&query=${placeInfo}`;
    }

    function handleButtonDown() {
        setIsActive(true);
        window.open(buildGoogleMapsUrl(), "_blank", "noopener,noreferrer");
    }

    return (
        <button
            className={`results-drawer__open-in-google-maps-button${isActive ? " results-drawer__open-in-google-maps-button--active" : ""}`}
            type="button"
            onMouseDown={handleButtonDown}
            onMouseUp={() => setIsActive(false)}
            onMouseLeave={() => setIsActive(false)}
        >
            Google Maps
            <img src="frontend/assets/popOutIcon.png" alt="" className="results-drawer__popout-icon" />
        </button>
    );
}

function ResultsDrawer() {
    const { searchText, areaName, vendors, activeFilters, setActiveFilters, drawerHeight, setDrawerHeight } = useAppContext();
    const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);
    const dragStartRef = useRef(null);

    const hasSearchedText = searchText.trim().length > 0;
    const hasVendors = vendors.length > 0;

    const drawerFilters = hasSearchedText
        ? [
            { id: "openNow", label: "Open now" },
            { id: "confirmedPurchase", label: "Confirmed purchase" }
        ]
        : [
            { id: "openNow", label: "Open now" }
        ];

    function handleDragStart(event) {
        dragStartRef.current = {
            pointerY: event.clientY,
            drawerHeight,
        };
    }

    function toggleFilter(filterId) {
        setActiveFilters({
            ...activeFilters,
            [filterId]: !activeFilters[filterId]
        });
    }

    useEffect(() => {
        setDrawerHeight(hasSearchedText ? DEFAULT_DRAWER_HEIGHT : COLLAPSED_DRAWER_HEIGHT);
    }, [hasSearchedText]);

    useEffect(() => {
        if (isDesktop) return;

        function handlePointerMove(event) {
            if (dragStartRef.current === null) return;

            const maxDrawerHeight = window.innerHeight * MAX_DRAWER_HEIGHT_RATIO;
            const dragDistance = dragStartRef.current.pointerY - event.clientY;
            const nextDrawerHeight = dragStartRef.current.drawerHeight + dragDistance;

            setDrawerHeight(clamp(nextDrawerHeight, COLLAPSED_DRAWER_HEIGHT, maxDrawerHeight));
        }

        function handlePointerUp() {
            dragStartRef.current = null;
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [isDesktop]);

    return (
        <aside
            className="results-drawer"
            style={isDesktop ? undefined : { height: `${drawerHeight}px` }}
            aria-label="Search results"
        >
            {!isDesktop && (
                <button
                    className="results-drawer__resize-handle"
                    type="button"
                    aria-label="Resize results drawer"
                    onPointerDown={handleDragStart}
                >
                    <span className="results-drawer__handle-bar" />
                </button>
            )}

            <header className="results-drawer__title-row">
                <div>
                    <h2 className="results-drawer__title">
                        {hasSearchedText ? searchText : areaName}
                    </h2>
                </div>
            </header>

            {hasVendors && (
                <section className="results-drawer__filter-row" aria-label="Vendor filters">
                    {drawerFilters.map((filter) => (
                        <button
                            className={`results-drawer__filter-chip${
                                activeFilters[filter.id] ? " results-drawer__filter-chip--active" : ""
                            }`}
                            type="button"
                            key={filter.id}
                            aria-pressed={activeFilters[filter.id]}
                            onClick={() => toggleFilter(filter.id)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </section>
            )}

            <section className="results-drawer__vendor-list" aria-label="Vendors">
                {hasVendors ? (
                    vendors.map((vendor) => (
                        <article className="results-drawer__vendor-card" key={vendor.id}>
                            <div className="results-drawer__vendor-info-container">
                                <h3 className="results-drawer__vendor-name">{vendor.name}</h3>
                                <p className="results-drawer__vendor-detail">{vendor.address}</p>
                                <p className="results-drawer__vendor-detail">{toTitleCase(vendor.description)}</p>
                            </div>
                            <div className="results-drawer__vendor-maps-link-button-container">
                                <OpenInGoogleMapsButton
                                    vendorName={vendor.name}
                                    vendorAddress={vendor.address}
                                />
                            </div>
                        </article>
                    ))
                ) : (
                    <p className="results-drawer__empty-text">
                        No vendors currently found.
                    </p>
                )}
            </section>
        </aside>
    );
}

export default ResultsDrawer;