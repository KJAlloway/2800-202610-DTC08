import "dotenv/config";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

await client.connect();
console.log("Connected with mongodb driver");
await client.close();