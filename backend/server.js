// const express  = require("express");
// const cors = require("cors");

import express from "express"
import cors from "cors"
import router from "./routes/routesTest.js";

const app = express();
const PORT = 3000;

app.use(express.json());
// app.use(cors({origin: 'http://localhost:5173'})); // React frontend URL
app.use(cors())

app.use(router)
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})