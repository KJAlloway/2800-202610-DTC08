import express from "express";
import {
    createReceipt,
    getVendorSightingsForIngredient,
    getIngredientSightingsForVendor,
    getMyReceipts,
    deleteReceipt,
} from "../controllers/receiptController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// POST /db/receipts  — log a found/not-found sighting (auth required)
router.post("/", authenticate, createReceipt);

// GET /db/receipts/mine  — get the current user's receipts (auth required)
router.get("/mine", authenticate, getMyReceipts);

// GET /db/receipts/ingredient/:ingredientId/vendors
// Returns per-vendor sighting counts for a given ingredient (public)
router.get("/ingredient/:ingredientId/vendors", getVendorSightingsForIngredient);

// GET /db/receipts/vendor/:osmId
// Returns per-ingredient sighting counts for a given vendor (public)
router.get("/vendor/:osmId", getIngredientSightingsForVendor);

// DELETE /db/receipts/:id  — delete own receipt (auth required)
router.delete("/:id", authenticate, deleteReceipt);

export const receiptRouter = router;
