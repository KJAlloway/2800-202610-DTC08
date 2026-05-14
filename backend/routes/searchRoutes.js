/**
 * Search routes.
 *
 * Routes should stay small: define the URL and hand off to controllers.
 */

import { Router } from 'express';
import { searchVendors } from '../controllers/searchController.js';

const router = Router();

router.get('/vendors', searchVendors);

export default router;
