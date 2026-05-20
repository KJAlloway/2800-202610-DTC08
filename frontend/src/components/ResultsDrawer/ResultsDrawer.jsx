import {useEffect, useRef, useState} from "react";
import {clamp, toTitleCase} from "../HelperFunctions.jsx"
import "./ResultsDrawer.css";
import OpenInGoogleMapsButton from "./OpenInGoogleMapsButton.jsx";

const COLLAPSED_DRAWER_HEIGHT = 70;
const DEFAULT_DRAWER_HEIGHT = 360;
const MAX_DRAWER_HEIGHT_RATIO = 0.85;

function ResultsDrawer({
                           searchedText = "",
                           areaName = "Current Map Area",
                           vendors = [],
                           className = "",
                       }) {
    const [drawerHeight, setDrawerHeight] = useState(COLLAPSED_DRAWER_HEIGHT);
    const dragStartRef = useRef(null);

    const hasSearchedText = searchedText.trim().length > 0;
    const [activeFilters, setActiveFilters] = useState({
        openNow: false,
        confirmedPurchase: false
    });
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
        setActiveFilters((currentFilters) => ({
            ...currentFilters,
            [filterId]: !currentFilters[filterId]
        }));
    }

    useEffect(() => {
        if (hasSearchedText) {
            setDrawerHeight(DEFAULT_DRAWER_HEIGHT);
            return;
        }

        setDrawerHeight(COLLAPSED_DRAWER_HEIGHT);
    }, [hasSearchedText]);

    useEffect(() => {
        function handlePointerMove(event) {
            if (dragStartRef.current === null) {
                return;
            }

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
    }, []);

    return (
        <aside
            className={`results-drawer ${className}`}
            style={{height: `${drawerHeight}px`}}
            aria-label="Search results"
        >
            <button
                className="results-drawer__resize-handle"
                type="button"
                aria-label="Resize results drawer"
                onPointerDown={handleDragStart}
            >
                <span className="results-drawer__handle-bar"/>
            </button>

            <header className="results-drawer__title-row">
                <div>
                    <h2 className="results-drawer__title">
                        {hasSearchedText ? searchedText : areaName}
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
                                <OpenInGoogleMapsButton vendorName={vendor.name}
                                                        vendorAddress={vendor.address}/>
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