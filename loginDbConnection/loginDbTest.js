import {MongoClient} from "mongodb";
import mongoose from "mongoose";
import 'dotenv/config'

const db_uri = process.env.MONGODB_URI;

const client = new MongoClient(db_uri);

export async function run() {
    try {
        const database = client.db("userAccounts");
        const collection = database.collection("users")

        if (await checkUserExists(getEmail(), collection)) {
            if (await checkUserPassword(getEmail(), getPassword(), collection)) {
                // set session user to user
                // redirect to home page
            }

        }

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function checkUserExists(emailToCheck, userCollection) {
    return new Promise((resolve, reject) => {
        try {
            if (!!userCollection.find({"email": emailToCheck},
                                      {projection: {_id: 0, username: 0, email: 0, password: 0}})) {
                resolve(true)
                return true;
            } else {
                resolve(false)
                return false;
            }
        } catch (err) {
            reject(err)
            return false;
        }
    })
}

async function checkUserPassword(emailToCheck, passwordToCheck, userCollection) {
    return new Promise((resolve, reject) => {
        try {
            if (!!userCollection.find({"email": emailToCheck, "password": passwordToCheck},
                                      {projection: {_id:0, username: 0, email: 0, password: 0}})) {
                resolve(true)
                return true;
            } else {
                resolve(false)
                return false;
            }
        } catch (err) {
            reject(err)
            return false;
        }
    })
}

function getEmail() {
    return "user@email.com"
}

function getPassword() {
    return "pword1"
}

const LoginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})








run().catch(console.dir);