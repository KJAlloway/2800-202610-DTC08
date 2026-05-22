/**
 * clear.js
 *
 * Wipes all collections. Useful before a fresh seed run, or to reset to a
 * clean state during development.
 *
 * Run with:  node scripts/clear.js
 */

import "dotenv/config";
import { connectToDatabase } from "../config/database.js";
import User from "../models/User.js";
import Ingredient from "../models/Ingredient.js";
import Vendor from "../models/Vendor.js";
import Receipt from "../models/Reciept.js";
import IngredientRequest from "../models/IngredientRequest.js";
import RefreshToken from "../models/RefreshToken.js";

async function main() {
    console.log("\n🗑  Cabbage Patch — clear all collections");
    console.log("─".repeat(40));

    await connectToDatabase();

    const results = await Promise.all([
        User.deleteMany({}).then(r => ({ name: "Users",               count: r.deletedCount })),
        Ingredient.deleteMany({}).then(r => ({ name: "Ingredients",   count: r.deletedCount })),
        Vendor.deleteMany({}).then(r => ({ name: "Vendors",           count: r.deletedCount })),
        Receipt.deleteMany({}).then(r => ({ name: "Receipts",         count: r.deletedCount })),
        IngredientRequest.deleteMany({}).then(r => ({ name: "Requests", count: r.deletedCount })),
        RefreshToken.deleteMany({}).then(r => ({ name: "RefreshTokens", count: r.deletedCount })),
    ]);

    results.forEach(({ name, count }) => console.log(`  ✓ ${name}: ${count} deleted`));
    console.log("─".repeat(40));
    console.log("✅ All collections cleared.\n");

    process.exit(0);
}

main().catch((err) => {
    console.error("Clear failed:", err);
    process.exit(1);
});
