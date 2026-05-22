import { useEffect, useRef, useState } from "react";
import { clamp, toTitleCase } from "../../utils/HelperFunctions.js";
import "./ResultsDrawer.css";
import { useAppContext } from "../../context/AppContext.jsx";
import { COLLAPSED_DRAWER_HEIGHT } from "../../context/AppContext.jsx";
import { useMediaQuery, DESKTOP_BREAKPOINT } from "../../hooks/useMediaQuery.js";

const DEFAULT_DRAWER_HEIGHT = 360;
const MAX_DRAWER_HEIGHT_RATIO = 0.85;

// Changed from VendorCard(vendor) to destructured props so we can receive
// isSelected and onClick from the list render without touching the team's
// internal logic.
function VendorCard({ vendor, isSelected, onClick }) {

    function addHoursIfExist(hours) {
        if (hours !== undefined) {
            return <p className="results-drawer__vendor-detail-hours"><b>Hours: </b>{hours}</p>;
        }
    }

    function OpenInGoogleMapsButton({ vendorName, vendorAddress }) {
        function buildGoogleMapsUrl() {
            const placeInfo = encodeURIComponent(vendorName + " " + vendorAddress);
            return `https://www.google.com/maps/search/?api=1&query=${placeInfo}`;
        }

        return (
            <p className="results-drawer__vendor-detail">
                <b><i><a className="results-drawer__vendor-detail" href={buildGoogleMapsUrl()} target="_blank" rel="noopener noreferrer">
                    Open In Google Maps
                </a></i></b>
            </p>
        );
    }

    function ExtraVendorInformation(vendor) {
        function addTagAndInfoIfExists(tagName, tag, type) {
            if (tag !== undefined) {
                if (type === "string") {
                    return <p className="results-drawer__vendor-detail"><b>{tagName}: </b>{toTitleCase(tag)}</p>;
                } else if (type === "phone") {
                    return <p className="results-drawer__vendor-detail">
                        <b>{tagName}: </b><a className="results-drawer__vendor-detail" href={"tel:" + tag}>{tag}</a>
                    </p>;
                } else if (type === "website") {
                    return <p className="results-drawer__vendor-detail">
                        <b>{tagName}: </b><a className="results-drawer__vendor-detail" href={tag} target="_blank" rel="noopener noreferrer">{tag}</a>
                    </p>;
                } else {
                    return <p className="results-drawer__vendor-detail"><b>{tagName}: </b>{tag}</p>;
                }
            }
        }

        return (
            <div>
                <div>
                    {addTagAndInfoIfExists('Phone', vendor.vendor.phone, "phone")}
                    {addTagAndInfoIfExists('Website', vendor.vendor.website, "website")}
                    {addTagAndInfoIfExists('Wheelchair Accessible', vendor.vendor.wheelchair, "string")}
                </div>
                <div className="results-drawer__vendor-detail-google-maps-button">
                    <OpenInGoogleMapsButton
                        vendorName={vendor.vendor.name}
                        vendorAddress={vendor.vendor.address}
                    />
                </div>
            </div>
        );
    }

    function addUnitIfExists(vendor) {
        return vendor.unit !== undefined ? ', Unit ' + vendor.unit : '';
    }

    function addCuisineIfExists(vendor) {
        return vendor.cuisine !== undefined ? toTitleCase(vendor.cuisine + ' ') : '';
    }

    return (
        <article
            className={`results-drawer__vendor-card${isSelected ? " results-drawer__vendor-card--selected" : ""}`}
            key={vendor.id}
            onClick={onClick}
        >
            <div>
                <h3 className="results-drawer__vendor-name">{vendor.name}</h3>
                <p className="results-drawer__vendor-detail">{vendor.address + addUnitIfExists(vendor)}</p>
                <p className="results-drawer__vendor-detail">{toTitleCase(addCuisineIfExists(vendor) + vendor.description)}</p>
                {addHoursIfExist(vendor.hours)}
            </div>
            <div className="results-drawer__vendor-info-container-expanded">
                <ExtraVendorInformation vendor={vendor} />
            </div>
        </article>
    );
}

function ResultsDrawer() {
    const {
        searchText, areaName, vendors, activeFilters, setActiveFilters,
        drawerHeight, setDrawerHeight, selectedVendor, selectVendor,
        isLoadingVendors
    } = useAppContext();
    const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);
    const dragStartRef = useRef(null);
    const vendorListRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const hasSearchedText = searchText.trim().length > 0;
    const hasVendors = vendors.length > 0;

    const displayVendors = selectedVendor
        ? [selectedVendor, ...vendors.filter(v => v.id !== selectedVendor.id)]
        : vendors;

    const drawerFilters = hasSearchedText
        ? [
            { id: "openNow", label: "Open now" },
            { id: "confirmedPurchase", label: "Confirmed purchase" }
        ]
        : [
            { id: "openNow", label: "Open now" }
        ];

    useEffect(() => {
        if (!selectedVendor) return;
        if (!isDesktop) setDrawerHeight(DEFAULT_DRAWER_HEIGHT);
        if (vendorListRef.current) vendorListRef.current.scrollTop = 0;
    }, [selectedVendor]);

    function handleDragStart(event) {
        setIsDragging(true);
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
            setIsDragging(false);
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
            className={`results-drawer${isDragging ? " results-drawer--dragging" : ""}`}
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

            <section
                ref={vendorListRef}
                className="results-drawer__vendor-list"
                aria-label="Vendors"
            >
                {isLoadingVendors ? (
                    <>
                        <div className="results-drawer__loading-card" aria-hidden="true">
                            <div className="results-drawer__loading-line results-drawer__loading-line--title" />
                            <div className="results-drawer__loading-line" />
                            <div className="results-drawer__loading-line results-drawer__loading-line--short" />
                        </div>
                        <div className="results-drawer__loading-card" aria-hidden="true">
                            <div className="results-drawer__loading-line results-drawer__loading-line--title" />
                            <div className="results-drawer__loading-line" />
                        </div>
                        <div className="results-drawer__loading-card" aria-hidden="true">
                            <div className="results-drawer__loading-line results-drawer__loading-line--title" />
                            <div className="results-drawer__loading-line results-drawer__loading-line--short" />
                        </div>
                        <p className="visually-hidden" role="status">Loading nearby vendors…</p>
                    </>
                ) : hasVendors ? (
                    displayVendors.map((vendor) => (
                        <VendorCard
                            key={vendor.id}
                            vendor={vendor}
                            isSelected={selectedVendor?.id === vendor.id}
                            onClick={() => selectVendor(vendor)}
                        />
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