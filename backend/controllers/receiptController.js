import Receipt from "../models/Reciept.js";
import Ingredient from "../models/Ingredient.js";

/**
 * POST /db/receipts
 * Body: { vendorOsmId, ingredientId, found }
 *
 * Logs that the authenticated user found (or didn't find) an ingredient at a
 * vendor. If the user has already submitted a receipt for this
 * vendor + ingredient combination, the existing record is updated so that
 * each user can only hold one vote per pair.
 */
export async function createReceipt(request, response) {
    try {
        const { vendorOsmId, ingredientId, found } = request.body;

        if (!vendorOsmId || !ingredientId || found === undefined) {
            return response.status(400).json({
                message: "vendorOsmId, ingredientId, and found are required.",
            });
        }

        if (typeof found !== "boolean") {
            return response.status(400).json({ message: "found must be a boolean." });
        }

        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) {
            return response.status(404).json({ message: "Ingredient not found." });
        }

        // Upsert: one receipt per user per vendor+ingredient pair.
        const receipt = await Receipt.findOneAndUpdate(
            { userId: request.user.userId, vendorOsmId, ingredientId },
            { found, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        response.status(201).json({ receipt });
    } catch (error) {
        console.error("createReceipt error:", error);
        response.status(500).json({ message: "Something went wrong saving the receipt." });
    }
}

/**
 * GET /db/receipts/ingredient/:ingredientId/vendors
 *
 * Returns an aggregate of found/notFound counts grouped by vendorOsmId for a
 * given ingredient. Used by the frontend to power the "Confirmed purchase"
 * filter — the response tells the app which vendors have at least one confirmed
 * sighting for the searched ingredient.
 *
 * Response shape:
 *   { vendors: [{ vendorOsmId, foundCount, notFoundCount }] }
 */
export async function getVendorSightingsForIngredient(request, response) {
    try {
        const { ingredientId } = request.params;

        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) {
            return response.status(404).json({ message: "Ingredient not found." });
        }

        const aggregated = await Receipt.aggregate([
            { $match: { ingredientId: ingredient._id } },
            {
                $group: {
                    _id: "$vendorOsmId",
                    foundCount: {
                        $sum: { $cond: [{ $eq: ["$found", true] }, 1, 0] },
                    },
                    notFoundCount: {
                        $sum: { $cond: [{ $eq: ["$found", false] }, 1, 0] },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    vendorOsmId: "$_id",
                    foundCount: 1,
                    notFoundCount: 1,
                },
            },
        ]);

        response.json({ vendors: aggregated });
    } catch (error) {
        console.error("getVendorSightingsForIngredient error:", error);
        response.status(500).json({ message: "Something went wrong fetching sightings." });
    }
}

/**
 * GET /db/receipts/vendor/:osmId
 *
 * Returns aggregate sighting counts for every ingredient at a specific vendor.
 * Used to display "X people found this here" on a vendor card.
 */
export async function getIngredientSightingsForVendor(request, response) {
    try {
        const { osmId } = request.params;

        const aggregated = await Receipt.aggregate([
            { $match: { vendorOsmId: osmId } },
            {
                $group: {
                    _id: "$ingredientId",
                    foundCount: {
                        $sum: { $cond: [{ $eq: ["$found", true] }, 1, 0] },
                    },
                    notFoundCount: {
                        $sum: { $cond: [{ $eq: ["$found", false] }, 1, 0] },
                    },
                },
            },
            {
                $lookup: {
                    from: "ingredients",
                    localField: "_id",
                    foreignField: "_id",
                    as: "ingredient",
                },
            },
            { $unwind: "$ingredient" },
            {
                $project: {
                    _id: 0,
                    ingredientId: "$_id",
                    ingredientName: "$ingredient.name",
                    foundCount: 1,
                    notFoundCount: 1,
                },
            },
            { $sort: { foundCount: -1 } },
        ]);

        response.json({ ingredients: aggregated });
    } catch (error) {
        console.error("getIngredientSightingsForVendor error:", error);
        response.status(500).json({ message: "Something went wrong fetching vendor sightings." });
    }
}

/**
 * GET /db/receipts/mine
 * Returns the authenticated user's own receipts, populated with ingredient names.
 */
export async function getMyReceipts(request, response) {
    try {
        const receipts = await Receipt.find({ userId: request.user.userId })
            .populate("ingredientId", "name")
            .sort({ createdAt: -1 });

        response.json({ receipts });
    } catch (error) {
        console.error("getMyReceipts error:", error);
        response.status(500).json({ message: "Something went wrong fetching your receipts." });
    }
}

/**
 * DELETE /db/receipts/:id
 * Deletes a receipt belonging to the authenticated user.
 */
export async function deleteReceipt(request, response) {
    try {
        const receipt = await Receipt.findById(request.params.id);

        if (!receipt) {
            return response.status(404).json({ message: "Receipt not found." });
        }

        if (receipt.userId.toString() !== request.user.userId.toString()) {
            return response.status(403).json({ message: "You can only delete your own receipts." });
        }

        await receipt.deleteOne();
        response.json({ message: "Receipt deleted." });
    } catch (error) {
        console.error("deleteReceipt error:", error);
        response.status(500).json({ message: "Something went wrong deleting the receipt." });
    }
}
