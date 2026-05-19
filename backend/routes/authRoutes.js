import express from "express";
import { register, login, refresh } from "../controllers/authController.js";

// This file is the "table of contents" for authentication endpoints.
// It maps each URL + HTTP method to a handler function in the controller.
// All actual logic lives in controllers/authController.js.
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

export const authRouter = router;
