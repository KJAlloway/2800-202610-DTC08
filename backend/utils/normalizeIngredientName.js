/**
 * Converts user-facing ingredient text into a stable search/dedupe key.
 */

export function normalizeIngredientName(name = '') {
    return String(name)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}
