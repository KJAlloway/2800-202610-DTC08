/**
 * enrichIngredient.js
 *
 * Calls the Anthropic API to generate aliases, cultural tags, category tags,
 * and OSM vendor-matching tags for a newly created ingredient.
 *
 * Returns a populated tag object on success, or null if the API key is
 * missing or the call fails — the caller falls back to empty arrays.
 *
 * Requires ANTHROPIC_API_KEY in .env.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// These are the exact values used throughout the app for vendor matching.
// Constraining the model to these lists keeps the returned tags consistent
// with what Overpass returns and what the search/filter system expects.
const VALID_OSM_CUISINE_TAGS = [
    "chinese", "cantonese", "japanese", "korean", "taiwanese",
    "thai", "vietnamese", "filipino", "indonesian", "malaysian",
    "indian", "pakistani", "south_asian", "asian",
    "middle_eastern", "arabic", "lebanese", "persian", "turkish", "israeli",
    "mediterranean", "greek", "italian", "french",
    "mexican", "latin_american", "caribbean", "peruvian",
    "ethiopian", "african", "west_african",
    "eastern_european", "polish", "russian",
];

const VALID_OSM_SHOP_TAGS = [
    "supermarket", "convenience", "greengrocer", "health_food",
    "seafood", "butcher", "bakery", "deli", "cheese", "spices",
];

export async function enrichIngredientWithAI(name) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.warn("ANTHROPIC_API_KEY not set — ingredient created without AI enrichment.");
        return null;
    }

    const prompt = `You are a culinary database assistant helping to classify food ingredients for a Vancouver-based app that helps people find cultural ingredients at local shops.

Ingredient to classify: "${name}"

Return ONLY a valid JSON object with exactly these fields:

{
  "aliases": ["alternative name 1", "alternate spelling", "regional name"],
  "culturalTags": ["cuisine1", "cuisine2"],
  "categoryTags": ["category1", "category2"],
  "osmCuisineTags": ["osm_value1", "osm_value2"],
  "osmShopTags": ["shop_type1", "shop_type2"]
}

Rules:
- aliases: 2–6 common alternative names, spellings, or names in origin languages
- culturalTags: cuisines/cultures this ingredient is associated with, lowercase with underscores (e.g. "south_asian", "east_african")
- categoryTags: physical/culinary category (e.g. "dried", "fresh", "fermented", "paste", "spice", "herb", "root vegetable", "legume", "grain", "seafood", "condiment", "sauce", "flour")
- osmCuisineTags: choose ONLY from this list — ${VALID_OSM_CUISINE_TAGS.join(", ")}
- osmShopTags: choose ONLY from this list — ${VALID_OSM_SHOP_TAGS.join(", ")}

For osmShopTags, think: what type of shop in Vancouver would most likely stock this ingredient?
For osmCuisineTags, think: what cuisine tags on an OSM vendor would suggest they carry this?

Return only the JSON object. No explanation, no markdown, no code fences.`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(ANTHROPIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 600,
                messages: [{ role: "user", content: prompt }],
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            console.error("Anthropic API error:", response.status, await response.text());
            return null;
        }

        const data = await response.json();
        const text = (data.content?.[0]?.text ?? "").trim();

        // Strip any accidental markdown fences before parsing.
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        // Validate shape and filter OSM tags to only known-good values.
        return {
            aliases: Array.isArray(parsed.aliases)
                ? parsed.aliases.map(String).slice(0, 8)
                : [],
            culturalTags: Array.isArray(parsed.culturalTags)
                ? parsed.culturalTags.map(s => String(s).toLowerCase().replaceAll(" ", "_"))
                : [],
            categoryTags: Array.isArray(parsed.categoryTags)
                ? parsed.categoryTags.map(s => String(s).toLowerCase())
                : [],
            osmCuisineTags: Array.isArray(parsed.osmCuisineTags)
                ? parsed.osmCuisineTags.filter(v => VALID_OSM_CUISINE_TAGS.includes(v))
                : [],
            osmShopTags: Array.isArray(parsed.osmShopTags)
                ? parsed.osmShopTags.filter(v => VALID_OSM_SHOP_TAGS.includes(v))
                : [],
        };
    } catch (error) {
        if (error.name === "AbortError") {
            console.error("Anthropic API call timed out for ingredient:", name);
        } else {
            console.error("Failed to enrich ingredient:", error.message);
        }
        return null;
    }
}
