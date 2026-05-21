import express from "express";
import { register, login, refresh, logout, me } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export const authRouter = router;