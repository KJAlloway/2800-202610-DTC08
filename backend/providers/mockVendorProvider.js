/**
 * Demo-safe vendor provider.
 *
 * This local provider gives the frontend a stable search response before live
 * OpenStreetMap/Overpass work begins. It intentionally returns normalized vendor
 * objects so the frontend will not need to change when the provider changes.
 */

import {normalizeVendor} from '../utils/normalizeVendor.js';

const MOCK_VENDORS = Object.freeze([
    {
        name: 'Sunrise Market',
        address: '300 Powell St, Vancouver, BC',
        lat: 49.2839,
        lng: -123.0972,
        categories: ['grocery', 'produce', 'asian market'],
    },
    {
        name: 'East West Market',
        address: '4169 Main St, Vancouver, BC',
        lat: 49.2485,
        lng: -123.1010,
        categories: ['grocery', 'specialty market'],
    },
    {
        name: 'Bosa Foods',
        address: '562 Victoria Dr, Vancouver, BC',
        lat: 49.2784,
        lng: -123.0657,
        categories: ['italian market', 'deli', 'grocery'],
    },
    {
        name: 'T&T Supermarket',
        address: '179 Keefer Pl, Vancouver, BC',
        lat: 49.2798,
        lng: -123.1082,
        categories: ['asian market', 'supermarket', 'grocery'],
    },
    {
        name: 'Mexican Stop',
        address: 'Vancouver, BC',
        lat: 49.2827,
        lng: -123.1207,
        categories: ['latin market', 'grocery'],
    },
    {
        name: 'Persia Foods',
        address: '2827 W Broadway, Vancouver, BC',
        lat: 49.2641,
        lng: -123.1697,
        categories: ['middle eastern market', 'produce', 'grocery'],
    },
    {
        name: 'Fruiticana',
        address: 'Vancouver, BC',
        lat: 49.2240,
        lng: -123.1000,
        categories: ['south asian market', 'produce', 'grocery'],
    },
    {
        name: 'Kims Mart',
        address: '519 E Broadway, Vancouver, BC',
        lat: 49.2627,
        lng: -123.0929,
        categories: ['korean market', 'grocery'],
    },
    {
        name: 'Donald’s Market',
        address: '2342 E Hastings St, Vancouver, BC',
        lat: 49.2812,
        lng: -123.0565,
        categories: ['grocery', 'produce'],
    },
    {
        name: 'No Frills',
        address: 'Vancouver, BC',
        lat: 49.2497,
        lng: -123.0761,
        categories: ['supermarket', 'grocery'],
    },
]);

export async function searchMockVendors() {
    return MOCK_VENDORS.map((vendor, index) => normalizeVendor({
        ...vendor,
        id: `mock-vendor-${index + 1}`,
        source: 'mock',
        externalIds: {
            googlePlaceId: null,
            osmType: null,
            osmId: null,
        },
    }));
}
