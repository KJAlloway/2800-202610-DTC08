import Ingredient from "../models/Ingredient.js";

/**
 * GET /db/ingredients/search?q=text
 *
 * Searches ingredients by name, normalizedName, aliases, culturalTags, and
 * categoryTags using a case-insensitive regex. Returns up to 10 results,
 * ordered by how closely the normalizedName starts with the query term so
 * the best match is always first.
 */
export async function searchIngredients(request, response) {
    try {
        const q = (request.query.q ?? "").trim();

        if (q.length === 0) {
            return response.json({ ingredients: [] });
        }

        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "i");

        const ingredients = await Ingredient.find({
            $or: [
                { normalizedName: regex },
                { name: regex },
                { aliases: regex },
                { culturalTags: regex },
                { categoryTags: regex },
            ],
        }).limit(10);

        // Put ingredients whose normalizedName starts with the query first.
        const startsWithRegex = new RegExp(`^${escaped}`, "i");
        const sorted = [...ingredients].sort((a, b) => {
            const aStarts = startsWithRegex.test(a.normalizedName) ? 0 : 1;
            const bStarts = startsWithRegex.test(b.normalizedName) ? 0 : 1;
            return aStarts - bStarts;
        });

        response.json({ ingredients: sorted });
    } catch (error) {
        console.error("searchIngredients error:", error);
        response.status(500).json({ message: "Something went wrong searching ingredients." });
    }
}

/**
 * GET /db/ingredients/:id
 */
export async function getIngredient(request, response) {
    try {
        const ingredient = await Ingredient.findById(request.params.id);

        if (!ingredient) {
            return response.status(404).json({ message: "Ingredient not found." });
        }

        response.json({ ingredient });
    } catch (error) {
        console.error("getIngredient error:", error);
        response.status(500).json({ message: "Something went wrong fetching the ingredient." });
    }
}

/**
 * POST /db/ingredients
 * Body: { name, aliases?, culturalTags?, categoryTags?, osmCuisineTags?, osmShopTags? }
 *
 * Creates a new ingredient. Authenticated users can submit ingredients they
 * couldn't find in the DB. normalizedName is derived automatically.
 * Returns 409 if an ingredient with that normalizedName already exists.
 */
export async function createIngredient(request, response) {
    try {
        const { name, aliases, culturalTags, categoryTags, osmCuisineTags, osmShopTags } = request.body;

        if (!name || !name.trim()) {
            return response.status(400).json({ message: "Ingredient name is required." });
        }

        const normalizedName = name.trim().toLowerCase();

        const existing = await Ingredient.findOne({ normalizedName });
        if (existing) {
            return response.status(409).json({
                message: "An ingredient with that name already exists.",
                ingredient: existing,
            });
        }

        const ingredient = await Ingredient.create({
            name: name.trim(),
            normalizedName,
            aliases:        aliases        ?? [],
            culturalTags:   culturalTags   ?? [],
            categoryTags:   categoryTags   ?? [],
            osmCuisineTags: osmCuisineTags ?? [],
            osmShopTags:    osmShopTags    ?? [],
        });

        response.status(201).json({ ingredient });
    } catch (error) {
        console.error("createIngredient error:", error);
        response.status(500).json({ message: "Something went wrong creating the ingredient." });
    }
}
