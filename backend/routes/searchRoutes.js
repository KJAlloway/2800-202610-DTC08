import express from "express";
import { unifiedSearch } from "../controllers/searchController.js";

const router = express.Router();

// GET /db/search?q=text
router.get("/", unifiedSearch);

export const searchRouter = router;
