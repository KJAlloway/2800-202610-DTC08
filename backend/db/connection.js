import {MongoClient} from "mongodb";
import 'dotenv/config'

const db_uri = process.env.MONGODB_URI;
const client = new MongoClient(db_uri);

export async function run() {
    try {
        await client.connect();

        await client.db("googleApiTest").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // const database = client.db("googleApiTest");
        // const testItems = database.collection("testItems")
        // console.log(await testItems.find({"name": "triangle"}).toArray())
    } catch (err) {
        console.error(err)
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

let db = client.db("googleApiTest")


export default db;
// run().catch(console.dir);
