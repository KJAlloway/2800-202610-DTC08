const {MongoClient} = require("mongodb");
require("dotenv").config()


// const db_uri = process.env.MONGO_URI;
const db_uri = process.env.MONGODB_URI;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(db_uri);

async function run() {
    try {
        const database = client.db("googleApiTest");
        const testItems = database.collection("testItems")
        console.log(await testItems.find({"name": "triangle"}).toArray())

        console.log("success");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

run().catch(console.dir);