import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./config/database.js";
import { authRouter }       from "./routes/authRoutes.js";
import { ingredientRouter } from "./routes/ingredientRoutes.js";
import { receiptRouter }    from "./routes/receiptRoutes.js";
import { requestRouter }    from "./routes/requestRoutes.js";
import { searchRouter }     from "./routes/searchRoutes.js";

await connectToDatabase();

const app  = express();
const PORT = process.env.PORT || 3000;

// In production the frontend is on a different origin, so we need an explicit
// allow-list and credentials: true. In dev, the Vite proxy makes everything
// same-origin so this is largely a no-op.
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/db/auth",        authRouter);
app.use("/db/ingredients", ingredientRouter);
app.use("/db/receipts",    receiptRouter);
app.use("/db/requests",    requestRouter);
app.use("/db/search",      searchRouter);

app.get("/db/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${process.env.NODE_ENV ?? "development"})`);
});
