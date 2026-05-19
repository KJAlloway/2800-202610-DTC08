export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function toTitleCase(text) {
    return text.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

/*
 * Converts degrees into radians.
 *
 * Formula:
 *     radians = degrees * PI / 180
 */
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

/*
 * Calculates approximate distance between two latitude/longitude coordinates.
 *
 * How to use:
 * Pass the starting coordinate and ending coordinate:
 *
 *     calculateDistanceMeters(startLat, startLng, endLat, endLng)
 *
 * Why this exists:
 * Overpass finds vendors inside a radius, but it does not sort them by distance
 * from our current map center. We calculate distance ourselves so nearby results
 * appear first in the drawer.
 */
export function calculateDistanceMeters(startLatitude, startLongitude, endLatitude, endLongitude) {
    /*
     * Approximate Earth radius in meters.
     * This keeps the returned distance in meters too.
     */
    const earthRadiusMeters = 6371000;

    /*
     * Latitude/longitude values are in degrees.
     * JavaScript trig functions use radians, so we convert first.
     */
    const startLatitudeRadians = toRadians(startLatitude);
    const endLatitudeRadians = toRadians(endLatitude);

    /*
     * Difference between the two coordinates, also converted to radians.
     */
    const latitudeDifference = toRadians(endLatitude - startLatitude);
    const longitudeDifference = toRadians(endLongitude - startLongitude);

    /*
     * Haversine formula.
     *
     * This gives a good approximate distance between two points on Earth.
     * The ** operator means "to the power of", so ** 2 means squared.
     */
    const haversine = Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(startLatitudeRadians) *
        Math.cos(endLatitudeRadians) *
        Math.sin(longitudeDifference / 2) ** 2;

    /*
     * Convert the haversine value into meters.
     * Math.round keeps the result as a clean whole-number distance.
     */
    return Math.round(earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}