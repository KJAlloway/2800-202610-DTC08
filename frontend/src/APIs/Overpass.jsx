import { calculateDistanceMeters } from "../utils/HelperFunctions.js";

const VENDOR_LOOKUP_DELAY_MS = 1000;

// How far the center must travel (as a fraction of the search radius) before we fire
// a new query. At 0.45, zoomed to 3 km radius you'd need to pan ~1.35 km first.
const REFETCH_THRESHOLD_RATIO = 0.45;

// Primary + mirror. On a 429 or 504 from the first, the second is tried automatically.
// overpass.kumi.systems is a community-run mirror with independent capacity.
const OVERPASS_INSTANCES = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
];

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
let lastQueriedCoordinates = null;
let lastQueriedRadius = null;

// Called by AppContext.searchCurrentArea() to force a fresh query on the next call,
// bypassing the displacement check.
export function resetVendorCache() {
    lastQueriedCoordinates = null;
    lastQueriedRadius = null;
}

// Used by AppContext to decide whether to show the "Search this area" button.
// Reads the same threshold and last-queried state as getNearbyVendors, so the button
// appears at exactly the point a live search would otherwise fire.
export function hasMovedPastSearchThreshold(coordinateArray, radiusMeters) {
    if (lastQueriedCoordinates === null) return false;
    const displacement = calculateDistanceMeters(
        lastQueriedCoordinates[0], lastQueriedCoordinates[1],
        coordinateArray[0], coordinateArray[1]
    );
    return displacement >= radiusMeters * REFETCH_THRESHOLD_RATIO;
}

export function getNearbyVendors(coordinateArray, vendorLookupOptions, onVendorsUpdate) {
    const radius = vendorLookupOptions.radiusMeters;

    // Skip if center hasn't moved enough AND the radius hasn't changed.
    // A radius change (zoom level change) always warrants a fresh query.
    if (lastQueriedCoordinates !== null && lastQueriedRadius === radius) {
        const displacement = calculateDistanceMeters(
            lastQueriedCoordinates[0], lastQueriedCoordinates[1],
            coordinateArray[0], coordinateArray[1]
        );
        if (displacement < radius * REFETCH_THRESHOLD_RATIO) {
            return false; // within cached area, no fetch needed
        }
    }

    latestCoordinateArray = coordinateArray;
    latestVendorLookupOptions = vendorLookupOptions;

    if (vendorLookupTimeoutId === null) {
        vendorLookupTimeoutId = setTimeout(async () => {
            lastQueriedCoordinates = latestCoordinateArray;
            lastQueriedRadius = latestVendorLookupOptions.radiusMeters;

            currentVendors = await requestNearbyVendorsFromOverpass(
                latestCoordinateArray,
                latestVendorLookupOptions
            );
            vendorLookupTimeoutId = null;

            onVendorsUpdate(currentVendors);
        }, VENDOR_LOOKUP_DELAY_MS);
    }

    return true; // fetch is pending
}

async function requestNearbyVendorsFromOverpass(coordinateArray, vendorLookupOptions) {
    const latitude = coordinateArray[0];
    const longitude = coordinateArray[1];
    const radiusMeters = vendorLookupOptions.radiusMeters;
    const maxResults = vendorLookupOptions.maxResults;

    const vendorShopPattern = VENDOR_SHOP_TYPES.join("|");

    // `nw` = nodes + ways. Relations are essentially never used for individual shops
    // or markets in OSM, so excluding them cuts the server work from 6 sub-queries
    // to 2 with no meaningful loss of results.
    const query = `
        [out:json][timeout:20];
        (
            nw["shop"~"^(${vendorShopPattern})$"](around:${radiusMeters},${latitude},${longitude});
            nw["amenity"="marketplace"](around:${radiusMeters},${latitude},${longitude});
        );
        out center tags ${maxResults};
    `;

    for (const url of OVERPASS_INSTANCES) {
        try {
            const response = await fetch(url, {
                method: "POST",
                body: new URLSearchParams({ data: query }),
            });

            // On rate-limit or gateway timeout, fall through to the mirror instance.
            if (response.status === 429 || response.status === 504) continue;
            if (!response.ok) return [];

            const data = await response.json();

            return (data.elements ?? [])
                .map((element) => createVendorFromOsmElement(element, latitude, longitude))
                .filter((vendor) => vendor !== null)
                .sort((a, b) => a.distanceMeters - b.distanceMeters)
                .slice(0, maxResults);
        } catch (_error) {
            // Network error on this instance — try the next one.
            continue;
        }
    }

    return [];
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
        // Optional fields — present in OSM for some vendors, undefined for others.
        // VendorCard checks for undefined before rendering each one.
        phone: tags.phone ?? tags["contact:phone"],
        website: tags.website ?? tags["contact:website"] ?? tags.url,
        wheelchair: tags.wheelchair,
        hours: tags.opening_hours,
        cuisine: tags.cuisine,
        unit: tags["addr:unit"],
    };
}

function formatVendorDescription(tags) {
    return (tags.shop ?? tags.amenity ?? "vendor").replaceAll("_", " ");
}

function formatVendorAddress(tags) {
    const streetAddress = [tags["addr:housenumber"], tags["addr:street"]]
        .filter(Boolean)
        .join(" ");
    return streetAddress || tags["addr:full"] || "Address not listed";
}