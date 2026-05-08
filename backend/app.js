/**
 * Express app configuration.
 *
 * Keep this file focused on middleware and route mounting. Business logic belongs
 * in services/controllers so the app can stay easy to reason about.
 */

import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import healthRoutes from './routes/healthRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(express.json());
app.use(express.static(frontendPath));

app.use('/api/health', healthRoutes);
app.use('/api/search', searchRoutes);

export default app;
