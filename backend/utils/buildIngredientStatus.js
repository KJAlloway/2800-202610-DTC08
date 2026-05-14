/**
 * Builds the ingredient-specific status block attached to each vendor result.
 *
 * This placeholder keeps the response shape stable before report persistence is
 * implemented. Later, this function should summarize FOUND/NOT_FOUND reports.
 */

export function buildIngredientStatus() {
    return {
        status: 'UNKNOWN',
        lastConfirmedAt: null,
        foundCount: 0,
        notFoundCount: 0,
    };
}
