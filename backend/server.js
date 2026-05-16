import express from "express"
import cors from "cors"
import testRouter from "./routes/routesTest.js";
import aiAutocompleteRouter from "./routes/aiAutocompleteRoutes.js"

const app = express();
const PORT = 3000;

// Allows the backend to read JSON request bodies sent from the frontend.
// Without this, req.body would be undefined for POST requests.
app.use(express.json());

app.use(cors())

app.use("/api/aiAutocomplete", aiAutocompleteRouter)
app.use(testRouter)


// Created using AI for the autocomplete feature

// Allows the Vite frontend to call this backend during development.
// Vite usually runs on localhost:5173, but it may use 5174 if 5173 is busy.
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
]

app.use((req, res, next) => {
    const requestOrigin = req.headers.origin

    // Only allow browser requests from known local frontend development URLs.
    if (allowedOrigins.includes(requestOrigin)) {
        res.header('Access-Control-Allow-Origin', requestOrigin)
    }

    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

    // Browser preflight requests ask for permission before the real request.
    // If this is a preflight request, respond successfully and stop here.
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204)
    }

    next()
})

app.use(express.static('public'))

// Basic backend health check route.
// Seeing "Hello World!" at localhost:3000 means the backend is running.
app.get('/', (req, res) => {
    res.send('Hello World!')
})

// end of AI created section


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})



////--------------------------------------//
//// IDK where this came from
////--------------------------------------//
//
// import app from './app.js';
// import {env} from './config/env.js';
// import {connectDb} from './config/db.js';
//
// async function startServer() {
//     await connectDb();
//
//     app.listen(env.port, () => {
//         console.log(`Ingredient Finder server running at http://localhost:${env.port}`);
//     });
// }
//
// startServer().catch((error) => {
//     console.error('Failed to start server:', error);
//     process.exit(1);
// });
//
//
//
// // const express  = require("express");
// // const session = require("express-session");
// // const app = express();
//
// // app.use(express.urlencoded({extended: true}));
//
// // app.use(session({
// //     secret: "secret-key",
// //     resave: false,
// //     saveUninitialized: false
// // }))
//
//
//
// // const authRoutes = require("./routes/authRoutes")
//
// // app.use("/auth", authRoutes);
//
// // const PORT = 3000;
//
// // app.listen(PORT, () => {
// //     console.log(`Server is running on http://localhost:${PORT}`)
// // })
//
// // app.get("/", (req, res) => {
// //     res.send("Hello World!");
// })