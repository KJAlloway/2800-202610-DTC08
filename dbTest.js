import {MongoClient} from "mongodb";
import ("dotenv").configure()

const db_uri = process.env.MONGODB_URI;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(db_uri);

export async function run() {
    try {
        const database = client.db("googleApiTest");
        const testItems = database.collection("testItems")
        console.log(await testItems.find({"name": "triangle"}).toArray())
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

run().catch(console.dir);