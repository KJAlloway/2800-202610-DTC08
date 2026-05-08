/**
 * Vendor search service.
 *
 * This is the first clean version of the app's core contract:
 * ingredient search -> possible vendors -> app-facing normalized response.
 *
 * Persistence and report enrichment will be added here later. For now, the mock
 * provider keeps the frontend/backend contract demo-safe.
 */

import {searchVendors as searchActiveProvider} from '../providers/activeVendorProvider.js';
import {normalizeIngredientName} from '../utils/normalizeIngredientName.js';
import {buildIngredientStatus} from '../utils/buildIngredientStatus.js';

export async function searchVendorsForIngredient({ingredientName, locationText, coordinates}) {
    const normalizedIngredientName = normalizeIngredientName(ingredientName);

    if (!normalizedIngredientName) {
        throw new Error('Ingredient name is required.');
    }

    const vendors = await searchActiveProvider({
        ingredientName,
        normalizedIngredientName,
        locationText,
        coordinates,
    });

    return {
        ingredient: {
            id: normalizedIngredientName,
            name: ingredientName.trim(),
            normalizedName: normalizedIngredientName,
        },
        searchLocation: {
            label: locationText?.trim() || 'Vancouver, BC',
            lat: parseCoordinate(coordinates?.lat),
            lng: parseCoordinate(coordinates?.lng),
        },
        vendors: vendors.map((vendor) => ({
            ...vendor,
            ingredientStatus: buildIngredientStatus(),
        })),
    };
}

function parseCoordinate(value) {
    const coordinate = Number(value);
    return Number.isFinite(coordinate) ? coordinate : null;
}
