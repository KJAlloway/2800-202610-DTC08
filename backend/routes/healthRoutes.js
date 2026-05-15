/**
 * Health-check routes.
 *
 * These are intentionally tiny and exist so we can confirm the backend is
 * running before working on feature routes.
 */

import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController.js';

const router = Router();

router.get('/', getHealthStatus);

export default router;
