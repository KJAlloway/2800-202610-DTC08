import IngredientRequest from "../models/IngredientRequest.js";
import Ingredient from "../models/Ingredient.js";

/**
 * POST /db/requests
 * Body: { ingredientId, neighbourhood }
 *
 * Creates a request indicating the authenticated user is looking for an
 * ingredient in a particular neighbourhood. A user may only have one active
 * request per ingredient+neighbourhood pair — duplicates return the existing
 * document rather than creating a second one.
 */
export async function createRequest(request, response) {
    try {
        const { ingredientId, neighbourhood } = request.body;

        if (!ingredientId || !neighbourhood) {
            return response.status(400).json({
                message: "ingredientId and neighbourhood are required.",
            });
        }

        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) {
            return response.status(404).json({ message: "Ingredient not found." });
        }

        // Prevent duplicate requests from the same user.
        const existing = await IngredientRequest.findOne({
            userId: request.user.userId,
            ingredientId,
            neighbourhood: neighbourhood.trim(),
        });

        if (existing) {
            return response.status(409).json({
                message: "You already have an active request for this ingredient in this neighbourhood.",
                request: existing,
            });
        }

        const newRequest = await IngredientRequest.create({
            userId: request.user.userId,
            ingredientId,
            neighbourhood: neighbourhood.trim(),
        });

        response.status(201).json({ request: newRequest });
    } catch (error) {
        console.error("createRequest error:", error);
        response.status(500).json({ message: "Something went wrong creating the request." });
    }
}

/**
 * GET /db/requests
 * Query params: neighbourhood (optional), ingredientId (optional)
 *
 * Returns ingredient requests visible to anyone. Useful for store owners or
 * admins to see what shoppers are looking for in their area.
 */
export async function getRequests(request, response) {
    try {
        const filter = {};

        if (request.query.neighbourhood) {
            filter.neighbourhood = new RegExp(
                request.query.neighbourhood.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );
        }

        if (request.query.ingredientId) {
            filter.ingredientId = request.query.ingredientId;
        }

        const requests = await IngredientRequest.find(filter)
            .populate("ingredientId", "name culturalTags categoryTags")
            .populate("userId", "name")
            .sort({ createdAt: -1 })
            .limit(100);

        response.json({ requests });
    } catch (error) {
        console.error("getRequests error:", error);
        response.status(500).json({ message: "Something went wrong fetching requests." });
    }
}

/**
 * GET /db/requests/mine
 * Returns the authenticated user's own requests.
 */
export async function getMyRequests(request, response) {
    try {
        const requests = await IngredientRequest.find({ userId: request.user.userId })
            .populate("ingredientId", "name culturalTags categoryTags")
            .sort({ createdAt: -1 });

        response.json({ requests });
    } catch (error) {
        console.error("getMyRequests error:", error);
        response.status(500).json({ message: "Something went wrong fetching your requests." });
    }
}

/**
 * DELETE /db/requests/:id
 * Deletes a request that belongs to the authenticated user.
 */
export async function deleteRequest(request, response) {
    try {
        const ingredientRequest = await IngredientRequest.findById(request.params.id);

        if (!ingredientRequest) {
            return response.status(404).json({ message: "Request not found." });
        }

        if (ingredientRequest.userId.toString() !== request.user.userId.toString()) {
            return response.status(403).json({ message: "You can only delete your own requests." });
        }

        await ingredientRequest.deleteOne();
        response.json({ message: "Request deleted." });
    } catch (error) {
        console.error("deleteRequest error:", error);
        response.status(500).json({ message: "Something went wrong deleting the request." });
    }
}

/**
 * GET /db/requests/ingredient/:ingredientId/summary
 *
 * Returns request counts grouped by neighbourhood for a given ingredient.
 * Useful for surfacing demand hotspots on the map.
 */
export async function getRequestSummaryForIngredient(request, response) {
    try {
        const { ingredientId } = request.params;

        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) {
            return response.status(404).json({ message: "Ingredient not found." });
        }

        const summary = await IngredientRequest.aggregate([
            { $match: { ingredientId: ingredient._id } },
            {
                $group: {
                    _id: "$neighbourhood",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    neighbourhood: "$_id",
                    count: 1,
                },
            },
            { $sort: { count: -1 } },
        ]);

        response.json({ neighbourhoods: summary, total: summary.reduce((acc, n) => acc + n.count, 0) });
    } catch (error) {
        console.error("getRequestSummaryForIngredient error:", error);
        response.status(500).json({ message: "Something went wrong fetching request summary." });
    }
}
