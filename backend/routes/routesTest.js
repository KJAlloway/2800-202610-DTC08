import express from "express";
import db from "../db/connection.js";

// Creates an instance of the Express router, used to define our routes
const router = express.Router();

// Gets a list of all the items
router.get("/", async (req, res) => {
    let collection = await db.collection("testItems");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
});

// Lists restaurants that match the query filter
router.get("/browse", async (req, res) => {
    try {
        let collection = await db.collection("testItems");
        let query = {
            name: "triangle"
        };
        let results = await collection.find(query).toArray();
        res.send(results).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error browsing testItems");
    }
});

export default router;
