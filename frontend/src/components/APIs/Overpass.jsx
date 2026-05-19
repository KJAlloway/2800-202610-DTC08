import {calculateDistanceMeters} from "../HelperFunctions";

const VENDOR_LOOKUP_DELAY_MS = 1000;

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

const VENDOR_SHOP_TYPES = [
    "supermarket",
    "convenience",
    "greengrocer",
    "health_food",
    "seafood",
    "butcher",
    "bakery",
    "deli",
    "cheese",
    "spices",
];

let currentVendors = [];
let latestCoordinateArray = null;
let latestVendorLookupOptions = null;
let vendorLookupTimeoutId = null;

export function getNearbyVendors(coordinateArray, vendorLookupOptions, onVendorsUpdate) {
    latestCoordinateArray = coordinateArray;
    latestVendorLookupOptions = vendorLookupOptions;

    if (vendorLookupTimeoutId === null) {
        vendorLookupTimeoutId = setTimeout(async () => {
            currentVendors = await requestNearbyVendorsFromOverpass(
                latestCoordinateArray,
                latestVendorLookupOptions
            );
            vendorLookupTimeoutId = null;

            onVendorsUpdate(currentVendors);
        }, VENDOR_LOOKUP_DELAY_MS);
    }

    return currentVendors;
}

async function requestNearbyVendorsFromOverpass(coordinateArray, vendorLookupOptions) {

    const latitude = coordinateArray[0];
    const longitude = coordinateArray[1];

    const radiusMeters = vendorLookupOptions.radiusMeters;
    const maxResults = vendorLookupOptions.maxResults;

    const vendorShopPattern = VENDOR_SHOP_TYPES.join("|");

    const query = `
        [out:json][timeout:15];
        (
            node["shop"~"^(${vendorShopPattern})$"](around:${radiusMeters},${latitude},${longitude});
            way["shop"~"^(${vendorShopPattern})$"](around:${radiusMeters},${latitude},${longitude});
            relation["shop"~"^(${vendorShopPattern})$"](around:${radiusMeters},${latitude},${longitude});
            node["amenity"="marketplace"](around:${radiusMeters},${latitude},${longitude});
            way["amenity"="marketplace"](around:${radiusMeters},${latitude},${longitude});
            relation["amenity"="marketplace"](around:${radiusMeters},${latitude},${longitude});
        );
        out center tags ${maxResults};
    `;

    try {
        const response = await fetch(OVERPASS_API_URL, {
            method: "POST",
            body: new URLSearchParams({data: query}),
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        return (data.elements ?? [])
            .map((element) => createVendorFromOsmElement(element, latitude, longitude))
            .filter((vendor) => vendor !== null)
            .sort((firstVendor, secondVendor) => firstVendor.distanceMeters - secondVendor.distanceMeters)
            .slice(0, maxResults);
    } catch (_error) {
        return [];
    }
}

function createVendorFromOsmElement(element, latitude, longitude) {
    const tags = element.tags ?? {};

    const vendorLatitude = element.lat ?? element.center?.lat;
    const vendorLongitude = element.lon ?? element.center?.lon;

    if (tags.name === undefined || vendorLatitude === undefined || vendorLongitude === undefined) {
        return null;
    }

    return {
        id: `${element.type}-${element.id}`,
        name: tags.name,
        address: formatVendorAddress(tags),
        description: formatVendorDescription(tags),
        latitude: vendorLatitude,
        longitude: vendorLongitude,
        distanceMeters: calculateDistanceMeters(latitude, longitude, vendorLatitude, vendorLongitude),
    };
}

function formatVendorDescription(tags) {
    const vendorType = tags.shop ?? tags.amenity ?? "vendor";

    return vendorType.replaceAll("_", " ");
}

function formatVendorAddress(tags) {
    const streetAddress = [tags["addr:housenumber"], tags["addr:street"]]
        .filter(Boolean)
        .join(" ");

    return streetAddress || tags["addr:full"] || "Address not listed";
}