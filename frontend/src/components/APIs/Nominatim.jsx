export const DEFAULT_AREA_NAME = "Vancouver";
const AREA_LOOKUP_DELAY_MS = 1000;

let currentAreaName = DEFAULT_AREA_NAME;
let latestCoordinateArray = null;
let areaLookupTimeoutId = null;

export function getAreaName(coordinateArray, onAreaNameUpdate) {
    latestCoordinateArray = coordinateArray;

    if (areaLookupTimeoutId === null) {
        areaLookupTimeoutId = setTimeout(async () => {
            currentAreaName = await requestAreaNameFromNominatim(latestCoordinateArray);
            areaLookupTimeoutId = null;

            onAreaNameUpdate(currentAreaName);
        }, AREA_LOOKUP_DELAY_MS);
    }

    return currentAreaName;
}

async function requestAreaNameFromNominatim(coordinateArray) {
    const latitude = coordinateArray[0];
    const longitude = coordinateArray[1];

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1&layer=address`
        );

        if (!response.ok) {
            return DEFAULT_AREA_NAME;
        }

        const data = await response.json();
        const address = data.address ?? {};

        return (
            address.neighbourhood ??
            address.suburb ??
            address.city_district ??
            address.city ??
            address.town ??
            address.village ??
            data.name ??
            DEFAULT_AREA_NAME
        );
    } catch (_error) {
        return DEFAULT_AREA_NAME;
    }
}