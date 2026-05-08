/**
 * Converts provider-specific vendor data into the frontend contract.
 *
 * Keep this shape stable. Provider adapters can change; frontend expectations
 * should not.
 */

export function normalizeVendor(vendor) {
    return {
        id: String(vendor.id),
        name: vendor.name,
        address: vendor.address,
        lat: vendor.lat,
        lng: vendor.lng,
        source: vendor.source,
        categories: vendor.categories || [],
        externalIds: vendor.externalIds || {
            googlePlaceId: null,
            osmType: null,
            osmId: null,
        },
    };
}
