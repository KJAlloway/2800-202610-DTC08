import { useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "./Map.css";
import "leaflet/dist/leaflet.css";
import { useAppContext } from "../../context/AppContext.jsx";

function MapViewUpdater({ flyTarget }) {
    const map = useMap();

    useEffect(() => {
        if (flyTarget) {
            map.flyTo(flyTarget, map.getZoom(), { animate: true, duration: 1.2 });
        }
    }, [flyTarget, map]);

    return null;
}

function MapCenterReporter({ onCenterChange }) {
    const map = useMapEvents({
        moveend() {
            const center = map.getCenter();
            onCenterChange([center.lat, center.lng]);
        },
    });

    return null;
}

function Map() {
    const { mapCenter, setMapCenter, flyTarget } = useAppContext();

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
        </MapContainer>
    );
}

export default Map;