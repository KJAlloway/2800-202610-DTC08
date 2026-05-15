/**
 * MongoDB connection helper.
 *
 * The server can boot without MongoDB for the first mock-provider demo. Once
 * report/request persistence is added, local development should provide
 * MONGODB_URI in `.env`.
 */

import mongoose from 'mongoose';
import {env} from './env.js';

export async function connectDb() {
    if (!env.mongodbUri) {
        console.warn('MONGODB_URI is not set. Starting without a database connection.');
        return;
    }

    await mongoose.connect(env.mongodbUri);
    console.log('Connected to MongoDB.');
}
