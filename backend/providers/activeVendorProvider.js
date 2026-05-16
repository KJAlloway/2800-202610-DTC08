/**
 * Active vendor provider selector.
 *
 * The rest of the backend imports this file instead of importing mock, Overpass,
 * or Google providers directly. That keeps provider choice from leaking through
 * the app.
 */

import {env} from '../config/env.js';
import {searchMockVendors} from './mockVendorProvider.js';

export async function searchVendors(searchParams) {
    switch (env.activeVendorProvider) {
        case 'mock':
            return searchMockVendors(searchParams);
        default:
            throw new Error(`Unsupported vendor provider: ${env.activeVendorProvider}`);
    }
}
