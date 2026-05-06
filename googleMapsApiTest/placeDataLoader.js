import {MongoClient} from "mongodb";
import 'dotenv/config'

const db_uri = process.env.MONGODB_URI;

const client = new MongoClient(db_uri);

async function run(newDocument) {
    try {
        const database = client.db("googleApiTest");
        const testLocations = database.collection("testLocations")
        await testLocations.insertOne(newDocument)
        console.log("new document added to location db")
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

run().catch(console.dir);