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
        await getPlaceName(placeId, testLocations)


    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

function usePlaceUri(placeUri){
    console.log(placeUri);
}

async function getPlaceId() {
    return "ChIJZV8uqmdxhlQRL4MIXiV6jbI"
}

async function getPlaceMapsLink(placeId, testLocations) {
    let place = await testLocations.findOne({"id" : placeId}, {projection: {_id: 0, googleMapsUri: 1}})
    usePlaceUri(place.googleMapsUri);
}

async function getPlaceName(placeId, testLocations){
    let place = await testLocations.findOne({"id" : placeId}, {projection: {_id: 0, displayName: 1}})
    usePlaceUri(place.displayName.text);
}

run().catch(console.dir);