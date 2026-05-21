import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

export async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("Missing MONGODB_URI in .env");
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
}