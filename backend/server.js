/**
 * Backend process entry point.
 *
 * This file owns startup concerns only: environment config, optional database
 * connection, and listening on the configured port.
 */

import app from './app.js';
import {env} from './config/env.js';
import {connectDb} from './config/db.js';

async function startServer() {
    await connectDb();

    app.listen(env.port, () => {
        console.log(`Ingredient Finder server running at http://localhost:${env.port}`);
    });
}

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
