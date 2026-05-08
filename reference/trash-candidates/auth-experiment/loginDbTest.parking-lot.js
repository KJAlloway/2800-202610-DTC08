/**
 * PARKING LOT FILE — see README.md in this folder before reusing.
 */

import {MongoClient} from "mongodb";
import mongoose from "mongoose";
import 'dotenv/config'

const db_uri = process.env.MONGODB_URI;

const client = new MongoClient(db_uri);

export async function run() {
    try {
        const database = client.db("userAccounts");
        const collection = database.collection("users")

        // if (await checkUserExists(getEmail(), collection)) {
        //     if (await checkUserPassword(getEmail(), getPassword(), collection)) {
        //         // set session user to user
        //         // redirect to home page
        //     }
        //
        // }

    } catch (err) {
        console.log(err)
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function checkEmailExists(emailToCheck, userCollection) {
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

// returns true on successful creation
async function createNewUser(newUsername, newEmail, newPassword, userCollection){
    return new Promise(async (resolve, reject) => {
        try {
            // checks if email in DB already
            if (await checkEmailExists(newEmail, userCollection)) {
                resolve(false)
                return false
            }
            console.log("email already in use")

            // if not, insert a new user
            await userCollection.insertOne({
                name: newUsername,
                email: newEmail,
                password: newPassword
            })
            resolve(true)
            return true

        } catch (err) {
            reject(err)
            return false;
        }
    })
}





run().catch(console.dir);