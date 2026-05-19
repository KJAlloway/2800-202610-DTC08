import { Router } from 'express';
import { searchForFoodLocations } from '../controllers/searchForFoodLocationsController.js';

const searchForFoodLocationsRouter = Router();

searchForFoodLocationsRouter.get("/foodLocations", searchForFoodLocations)

export default searchForFoodLocationsRouter