import express from "express";
import {
    createRequest,
    getRequests,
    getMyRequests,
    deleteRequest,
    getRequestSummaryForIngredient,
} from "../controllers/requestController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// POST /db/requests  — create a new ingredient request (auth required)
router.post("/", authenticate, createRequest);

// GET /db/requests/mine  — get the current user's requests (auth required)
router.get("/mine", authenticate, getMyRequests);

// GET /db/requests/ingredient/:ingredientId/summary  — neighbourhood demand heatmap (public)
router.get("/ingredient/:ingredientId/summary", getRequestSummaryForIngredient);

// GET /db/requests  — browse all requests, filterable by neighbourhood & ingredientId (public)
router.get("/", getRequests);

// DELETE /db/requests/:id  — delete own request (auth required)
router.delete("/:id", authenticate, deleteRequest);

export const requestRouter = router;
