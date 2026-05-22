import express from "express";
import { searchIngredients, getIngredient, createIngredient } from "../controllers/ingredientController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// GET /db/ingredients/search?q=text
router.get("/search", searchIngredients);

// POST /db/ingredients  — create a new ingredient (auth required)
router.post("/", authenticate, createIngredient);

// GET /db/ingredients/:id
router.get("/:id", getIngredient);

export const ingredientRouter = router;
