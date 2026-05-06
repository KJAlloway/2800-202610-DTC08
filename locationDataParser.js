import {MongoClient} from "mongodb";
import 'dotenv/config'

const db_uri = process.env.MONGODB_URI;


const client = new MongoClient(db_uri);


export async function run() {
    try {
        const database = client.db("googleApiTest");
        const testLocations = database.collection("testLocations")

        let placeId = await getPlaceId()
        await getPlaceMapsLink(placeId, testLocations)

        let result = await testLocations.findOne({"id" : placeId}, {projection: {_id: 0, googleMapsUri: 1}})
        usePlaceUri(result.googleMapsUri);


    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function getPlaceMapsLink(placeId, testLocations) {
    let place = await testLocations.findOne({"id" : placeId})
    place.get
}

async function getPlaceId() {
    return "ChIJZV8uqmdxhlQRL4MIXiV6jbI"
}

function usePlaceUri(placeUri){
    console.log(placeUri);
}

run().catch(console.dir);