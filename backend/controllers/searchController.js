/**
 * Search controller.
 *
 * Owns request/response handling. Search workflow details belong in
 * `searchService.js`.
 */

import {searchVendorsForIngredient} from '../services/searchService.js';

export async function searchVendors(req, res) {
    try {
        const searchResult = await searchVendorsForIngredient({
            ingredientName: req.query.ingredient,
            locationText: req.query.location,
            coordinates: {
                lat: req.query.lat,
                lng: req.query.lng,
            },
        });

        res.json(searchResult);
    } catch (error) {
        res.status(400).json({
            error: {
                message: error.message,
                code: 'SEARCH_ERROR',
            },
        });
    }
}
