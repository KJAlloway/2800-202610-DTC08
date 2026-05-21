import { useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "./Map.css";
import "leaflet/dist/leaflet.css";

function MapViewUpdater({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), { animate: true, duration: 1.2 });
        }
    }, [center, map]);

    return null;
}

function MapCenterReporter({ onCenterChange }) {
    const map = useMapEvents({
        moveend() {
            reportMapCenter();
        },
        zoomend() {
            reportMapCenter();
        },
    });

    useEffect(() => {
        reportMapCenter();
    }, []);

    function reportMapCenter() {
        const center = map.getCenter();

        onCenterChange([center.lat, center.lng]);
    }
    return null;
}

function Map({ initialCenter, onCenterChange }) {
    return (
        <MapContainer
            center={initialCenter}
            zoom={13}
            zoomControl={false}
            attributionControl={false}
            className="map"
        >
            <TileLayer
                // attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapViewUpdater center={initialCenter} />
            <MapCenterReporter onCenterChange={onCenterChange} />
        </MapContainer>
    );
}

export default Map;