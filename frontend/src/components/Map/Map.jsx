import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "./Map.css";
import "leaflet/dist/leaflet.css";
import mapPinSvg from "../../../assets/map-pin.svg?raw";
import { useAppContext } from "../../context/AppContext.jsx";
import { useMediaQuery, DESKTOP_BREAKPOINT, DESKTOP_DRAWER_WIDTH } from "../../hooks/useMediaQuery.js";

const defaultIcon = L.divIcon({
    className: "",
    html: `<span class="vendor-marker-pin">${mapPinSvg}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
});

const selectedIcon = L.divIcon({
    className: "",
    html: `<span class="vendor-marker-pin vendor-marker-pin--selected">${mapPinSvg}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
});

// flyTo centers on the full container midpoint. We want the target to land at the
// center of the *visible* area (excluding the drawer), so we bake an offset into the
// target coordinates before handing them to Leaflet.
//
// Refs hold the latest drawer values so the effect doesn't re-fire on drawer resize —
// we just need the current snapshot at the moment flyTarget changes.
function MapViewUpdater({ flyTarget }) {
    const map = useMap();
    const { drawerHeight } = useAppContext();
    const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);

    const drawerHeightRef = useRef(drawerHeight);
    const isDesktopRef = useRef(isDesktop);
    drawerHeightRef.current = drawerHeight;
    isDesktopRef.current = isDesktop;

    useEffect(() => {
        if (!flyTarget) return;

        const zoom = map.getZoom();
        const offsetX = isDesktopRef.current ? -DESKTOP_DRAWER_WIDTH / 2 : 0;
        const offsetY = isDesktopRef.current ? 0 : drawerHeightRef.current / 2;

        map.flyTo(
            map.unproject(map.project(flyTarget, zoom).add([offsetX, offsetY]), zoom),
            zoom,
            { animate: true, duration: 1.2 }
        );
    }, [flyTarget, map]);

    return null;
}

// Reports the lat/lng at the center of the visible (non-drawer) area rather than the
// raw container center. Fires on moveend and whenever the visible area changes shape.
function MapCenterReporter({ onCenterChange }) {
    const { drawerHeight } = useAppContext();
    const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);

    const reportRef = useRef(null);

    const map = useMapEvents({
        moveend() {
            reportRef.current?.();
        },
    });

    function reportVisualCenter() {
        const size = map.getSize();
        const px = isDesktop
            ? DESKTOP_DRAWER_WIDTH + (size.x - DESKTOP_DRAWER_WIDTH) / 2
            : size.x / 2;
        const py = isDesktop
            ? size.y / 2
            : (size.y - drawerHeight) / 2;
        const latlng = map.containerPointToLatLng([px, py]);
        onCenterChange([latlng.lat, latlng.lng]);
    }

    reportRef.current = reportVisualCenter;

    useEffect(() => {
        reportVisualCenter();
    }, [drawerHeight, isDesktop]);

    return null;
}

function MapZoomReporter({ onZoomChange }) {
    useMapEvents({
        zoomend(e) {
            onZoomChange(e.target.getZoom());
        },
    });
    return null;
}

// Unselects the active vendor when the user clicks the map background.
// Leaflet stops propagation on interactive layers (markers), so this only
// fires on genuine background taps — not when clicking a pin.
function MapClickHandler() {
    const { unselectVendor } = useAppContext();
    useMapEvents({ click: unselectVendor });
    return null;
}

function VendorMarkers() {
    const { vendors, selectedVendor, selectVendor } = useAppContext();

    return vendors.map((vendor) => (
        <Marker
            key={vendor.id}
            position={[vendor.latitude, vendor.longitude]}
            icon={selectedVendor?.id === vendor.id ? selectedIcon : defaultIcon}
            eventHandlers={{
                click: () => selectVendor(vendor),
            }}
        />
    ));
}

function Map() {
    const { mapCenter, setMapCenter, flyTarget, setMapZoom } = useAppContext();

    return (
        <MapContainer
            center={mapCenter}
            zoom={13}
            zoomControl={false}
            attributionControl={false}
            className="map"
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapViewUpdater flyTarget={flyTarget} />
            <MapCenterReporter onCenterChange={setMapCenter} />
            <MapZoomReporter onZoomChange={setMapZoom} />
            <MapClickHandler />
            <VendorMarkers />
        </MapContainer>
    );
}

export default Map;