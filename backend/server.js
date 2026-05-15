// const express  = require("express");
// const cors = require("cors");

import express from "express"
import cors from "cors"
import router from "./routes/routesTest.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors())

app.use(router)
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})






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