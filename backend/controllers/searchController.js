import Ingredient from "../models/Ingredient.js";
import Receipt from "../models/Reciept.js";

/**
 * Maps plain-language search terms that don't correspond to a specific
 * ingredient to the OSM cuisine/shop tag values they imply. This lets
 * "polish" or "middle eastern" produce meaningful tier-2 vendor matches
 * even when the DB has no ingredient with that name.
 *
 * Keys are lowercased. cuisines matches against vendor's OSM cuisine tag;
 * shops matches against vendor's OSM shop tag.
 */
const CUISINE_KEYWORD_MAP = {
    // East Asian
    korean:              { cuisines: ["korean"],                                          shops: ["supermarket"] },
    chinese:             { cuisines: ["chinese", "cantonese", "dim_sum", "hotpot"],       shops: ["supermarket"] },
    cantonese:           { cuisines: ["cantonese", "chinese"],                            shops: ["supermarket"] },
    japanese:            { cuisines: ["japanese", "sushi", "ramen", "udon"],             shops: ["supermarket"] },
    taiwanese:           { cuisines: ["taiwanese", "chinese"],                            shops: ["supermarket"] },
    "east asian":        { cuisines: ["chinese", "japanese", "korean", "asian"],          shops: ["supermarket"] },
    asian:               { cuisines: ["asian", "chinese", "japanese", "korean", "thai"],  shops: ["supermarket"] },
    // South Asian
    indian:              { cuisines: ["indian"],                                           shops: ["supermarket", "spices"] },
    pakistani:           { cuisines: ["pakistani", "indian"],                             shops: ["supermarket"] },
    "south asian":       { cuisines: ["indian", "pakistani", "bangladeshi", "sri_lankan"], shops: ["supermarket", "spices"] },
    // Southeast Asian
    thai:                { cuisines: ["thai"],                                             shops: ["supermarket"] },
    vietnamese:          { cuisines: ["vietnamese"],                                       shops: ["supermarket"] },
    filipino:            { cuisines: ["filipino"],                                         shops: ["supermarket"] },
    indonesian:          { cuisines: ["indonesian"],                                       shops: ["supermarket"] },
    malaysian:           { cuisines: ["malaysian"],                                        shops: ["supermarket"] },
    "southeast asian":   { cuisines: ["thai", "vietnamese", "filipino", "indonesian", "malaysian"], shops: ["supermarket"] },
    // Middle Eastern & Mediterranean
    "middle eastern":    { cuisines: ["middle_eastern", "arabic", "lebanese", "persian", "turkish", "israeli"], shops: ["deli", "supermarket"] },
    persian:             { cuisines: ["persian", "iranian"],                              shops: ["supermarket", "deli"] },
    lebanese:            { cuisines: ["lebanese", "arabic", "middle_eastern"],            shops: ["deli"] },
    turkish:             { cuisines: ["turkish", "middle_eastern"],                       shops: ["deli"] },
    mediterranean:       { cuisines: ["mediterranean", "greek", "turkish", "lebanese", "italian"], shops: ["deli"] },
    greek:               { cuisines: ["greek", "mediterranean"],                          shops: ["deli"] },
    arabic:              { cuisines: ["arabic", "middle_eastern", "lebanese"],            shops: ["deli"] },
    moroccan:            { cuisines: ["moroccan", "north_african"],                       shops: ["deli", "supermarket"] },
    "north african":     { cuisines: ["moroccan", "egyptian", "tunisian"],                shops: ["deli", "supermarket"] },
    // European
    italian:             { cuisines: ["italian"],                                          shops: ["deli"] },
    french:              { cuisines: ["french"],                                           shops: ["deli", "bakery", "cheese"] },
    polish:              { cuisines: ["polish", "eastern_european"],                      shops: ["deli", "supermarket"] },
    russian:             { cuisines: ["russian", "eastern_european"],                     shops: ["deli"] },
    ukrainian:           { cuisines: ["ukrainian", "eastern_european"],                   shops: ["deli"] },
    "eastern european":  { cuisines: ["eastern_european", "polish", "russian", "ukrainian"], shops: ["deli"] },
    german:              { cuisines: ["german"],                                           shops: ["deli", "butcher"] },
    spanish:             { cuisines: ["spanish"],                                          shops: ["deli"] },
    // Latin American
    mexican:             { cuisines: ["mexican"],                                          shops: ["supermarket"] },
    latin:               { cuisines: ["mexican", "latin_american", "caribbean", "peruvian", "colombian"], shops: ["supermarket"] },
    "latin american":    { cuisines: ["latin_american", "mexican", "caribbean", "peruvian"], shops: ["supermarket"] },
    caribbean:           { cuisines: ["caribbean", "jamaican"],                           shops: ["supermarket"] },
    peruvian:            { cuisines: ["peruvian"],                                         shops: ["supermarket"] },
    // African
    ethiopian:           { cuisines: ["ethiopian", "african"],                            shops: ["supermarket", "health_food"] },
    african:             { cuisines: ["african", "ethiopian", "west_african"],            shops: ["supermarket"] },
    // Shop type searches (no cuisine match, only shop type)
    "health food":       { cuisines: [],  shops: ["health_food"] },
    "health":            { cuisines: [],  shops: ["health_food"] },
    organic:             { cuisines: [],  shops: ["health_food"] },
    spice:               { cuisines: [],  shops: ["spices"] },
    spices:              { cuisines: [],  shops: ["spices"] },
    seafood:             { cuisines: [],  shops: ["seafood"] },
    butcher:             { cuisines: [],  shops: ["butcher"] },
    bakery:              { cuisines: [],  shops: ["bakery"] },
    deli:                { cuisines: [],  shops: ["deli"] },
    greengrocer:         { cuisines: [],  shops: ["greengrocer"] },
    produce:             { cuisines: [],  shops: ["greengrocer"] },
    supermarket:         { cuisines: [],  shops: ["supermarket"] },
    grocery:             { cuisines: [],  shops: ["supermarket", "convenience"] },
    market:              { cuisines: [],  shops: ["supermarket", "convenience", "greengrocer"] },
};

/**
 * GET /db/search?q=text
 *
 * Unified search endpoint. Returns everything the frontend needs to
 * classify vendors into three tiers in a single round trip:
 *
 *   ingredient      — best-matching ingredient doc, or null
 *   osmCuisineTags  — cuisine tags to match against vendor.cuisine OSM field
 *   osmShopTags     — shop tags to match against vendor.shop OSM field
 *   vendorSightings — confirmed/not-found counts per vendorOsmId (only when
 *                     an ingredient was matched, so tier-1 data is available)
 *   query           — the original query string, echoed back
 *
 * Priority for tag resolution:
 *   1. Ingredient match → use ingredient's osmCuisineTags + osmShopTags
 *   2. No ingredient    → look up query in CUISINE_KEYWORD_MAP
 *   3. Neither          → empty arrays (frontend shows all vendors, no ranking)
 */
export async function unifiedSearch(request, response) {
    try {
        const q = (request.query.q ?? "").trim();

        if (q.length === 0) {
            return response.json({
                ingredient: null,
                osmCuisineTags: [],
                osmShopTags: [],
                vendorSightings: [],
                query: q,
            });
        }

        // ── 1. Ingredient search ─────────────────────────────────────────
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "i");
        const startsWithRegex = new RegExp(`^${escaped}`, "i");

        const ingredients = await Ingredient.find({
            $or: [
                { normalizedName: regex },
                { name: regex },
                { aliases: regex },
                { culturalTags: regex },
                { categoryTags: regex },
            ],
        }).limit(10);

        // Best match: normalizedName starts with query beats partial match.
        ingredients.sort((a, b) => {
            const aScore = startsWithRegex.test(a.normalizedName) ? 0 : 1;
            const bScore = startsWithRegex.test(b.normalizedName) ? 0 : 1;
            return aScore - bScore;
        });

        const ingredient = ingredients[0] ?? null;

        // ── 2. Resolve OSM tags ──────────────────────────────────────────
        let osmCuisineTags = [];
        let osmShopTags    = [];

        if (ingredient) {
            osmCuisineTags = ingredient.osmCuisineTags;
            osmShopTags    = ingredient.osmShopTags;
        } else {
            const mapped = CUISINE_KEYWORD_MAP[q.toLowerCase()];
            if (mapped) {
                osmCuisineTags = mapped.cuisines;
                osmShopTags    = mapped.shops;
            }
        }

        // ── 3. Vendor sightings (tier-1 data) ────────────────────────────
        let vendorSightings = [];

        if (ingredient) {
            vendorSightings = await Receipt.aggregate([
                { $match: { ingredientId: ingredient._id } },
                {
                    $group: {
                        _id: "$vendorOsmId",
                        foundCount:    { $sum: { $cond: [{ $eq: ["$found", true]  }, 1, 0] } },
                        notFoundCount: { $sum: { $cond: [{ $eq: ["$found", false] }, 1, 0] } },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        vendorOsmId:   "$_id",
                        foundCount:    1,
                        notFoundCount: 1,
                    },
                },
            ]);
        }

        response.json({ ingredient, osmCuisineTags, osmShopTags, vendorSightings, query: q });
    } catch (error) {
        console.error("unifiedSearch error:", error);
        response.status(500).json({ message: "Something went wrong during search." });
    }
}
