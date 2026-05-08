/**
 * Centralized environment config.
 *
 * Import environment values from here instead of reading `process.env` in many
 * files. That keeps configuration easy to audit and change.
 */

import 'dotenv/config';

export const env = Object.freeze({
    port: Number(process.env.PORT) || 3000,
    mongodbUri: process.env.MONGODB_URI || '',
    activeVendorProvider: process.env.ACTIVE_VENDOR_PROVIDER || 'mock',
});
