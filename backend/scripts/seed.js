/**
 * seed.js
 *
 * Phase 1 — queries the Overpass API for *real* vendors in four Vancouver
 *            neighbourhoods using the exact same query the frontend uses.
 * Phase 2 — seeds users, ingredients, those real vendors, receipts, and
 *            ingredient requests so the data aligns with live map results.
 *
 * Vendor IDs are stored as "type-osmId" (e.g. "node-12345678") which is
 * exactly how Overpass.jsx formats them, so confirmed-purchase sightings
 * will light up on the actual map pins.
 *
 * Run:
 *   npm run seed          — append to existing data
 *   npm run seed:fresh    — wipe everything first, then seed
 */

import "dotenv/config";
import bcrypt from "bcrypt";
import { connectToDatabase } from "../config/database.js";
import User from "../models/User.js";
import Ingredient from "../models/Ingredient.js";
import Vendor from "../models/Vendor.js";
import Receipt from "../models/Reciept.js";
import IngredientRequest from "../models/IngredientRequest.js";

const CLEAR_FIRST = process.argv.includes("--clear");
const SALT_ROUNDS = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomRecentDate(daysAgo = 60) {
    return new Date(Date.now() - Math.random() * daysAgo * 86400000);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─── Neighbourhood centres ────────────────────────────────────────────────────

const NEIGHBOURHOODS = [
    { name: "Chinatown",        lat: 49.2793, lon: -123.1005, radius: 600 },
    { name: "Commercial Drive", lat: 49.2614, lon: -123.0694, radius: 600 },
    { name: "Punjabi Market",   lat: 49.2270, lon: -123.0947, radius: 600 },
    { name: "Kitsilano",        lat: 49.2673, lon: -123.1554, radius: 700 },
];

const SHOP_TYPES = [
    "supermarket","convenience","greengrocer","health_food",
    "seafood","butcher","bakery","deli","cheese","spices",
];

// ─── Overpass fetch ───────────────────────────────────────────────────────────

async function fetchVendorsForNeighbourhood(neighbourhood) {
    const { lat, lon, radius } = neighbourhood;
    const pattern = SHOP_TYPES.join("|");

    const query = `
        [out:json][timeout:25];
        (
            nw["shop"~"^(${pattern})$"](around:${radius},${lat},${lon});
            nw["amenity"="marketplace"](around:${radius},${lat},${lon});
        );
        out center tags 20;
    `;

    const INSTANCES = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
    ];

    for (const url of INSTANCES) {
        try {
            const res = await fetch(url, {
                method: "POST",
                body: new URLSearchParams({ data: query }),
                headers: { "User-Agent": "CabbagePatch-seed/1.0" },
                signal: AbortSignal.timeout(30000),
            });
            if (!res.ok) continue;
            const data = await res.json();
            return (data.elements ?? [])
                .filter(el => el.tags?.name)
                .map(el => ({
                    osmId:         `${el.type}-${el.id}`,
                    name:          el.tags.name,
                    neighbourhood: neighbourhood.name,
                    lat:           el.lat ?? el.center?.lat,
                    lon:           el.lon ?? el.center?.lon,
                    tags:          el.tags,
                }));
        } catch (err) {
            console.warn(`    ⚠  ${url} failed: ${err.message}`);
        }
    }
    return [];
}

// ─── Vendor profile inference ────────────────────────────────────────────────
// Returns { likely: [...normalizedNames], sometimes: [...normalizedNames] }
// for a vendor based on its real OSM tags.
//
// likely   → this shop reliably stocks these items (88% found rate)
// sometimes → occasionally stocked or niche (40% found rate)
// empty    → shop type has no overlap with our ingredient list (no receipts)
//
// Priority: specific cultural/name signals beat generic shop-type fallbacks.
// Butchers, bakeries, cheese shops, and plain convenience stores correctly
// return empty — they don't carry any of our ingredients.

function getVendorProfile(tags) {
    const name    = (tags.name ?? "").toLowerCase();
    const cuisine = (tags.cuisine ?? "").toLowerCase();
    const shop    = (tags.shop ?? tags.amenity ?? "").toLowerCase();

    // ── Classify the vendor ────────────────────────────────────────────────

    const isAsianSupermarket = shop === "supermarket" && (
        /chinese|korean|japanese|taiwanese|cantonese|asian/.test(cuisine) ||
        /t&t|t & t|sunrise|osaka|kim|hong.?kong|asia|pacific|oriental|lucky|dragon|viet|h.?mart|galleria|han.?kook|new asia|great wall/.test(name)
    );

    const isSouthAsianGrocery = !isAsianSupermarket && (
        shop === "supermarket" || shop === "convenience"
    ) && (
        /indian|south.?asian|punjabi|bangladeshi|sri.?lankan/.test(cuisine) ||
        /fruiticana|guru|punjab|india|masala|desi|halal|tandoor|bombay|spice bazaar/.test(name)
    );

    const isMediterraneanShop = !isAsianSupermarket && !isSouthAsianGrocery && (
        shop === "supermarket" || shop === "deli"
    ) && (
        /mediterranean|greek|italian|turkish|lebanese/.test(cuisine) ||
        /parthenon|bosa|mercato|grotta|mediterranean/.test(name)
    );

    const isHealthFoodStore = shop === "health_food" || (
        shop === "supermarket" && !isAsianSupermarket && !isSouthAsianGrocery && !isMediterraneanShop &&
        /whole.?food|choices|meinhardt|organic|planet.?organic|natura|capers/.test(name)
    );

    const isGeneralSupermarket = shop === "supermarket" &&
        !isAsianSupermarket && !isSouthAsianGrocery &&
        !isMediterraneanShop && !isHealthFoodStore;

    const isSouthAsianSpiceShop = shop === "spices" && (
        /indian|south.?asian|punjabi/.test(cuisine) ||
        /india|punjab|masala|spice/.test(name)
    );

    const isAsianGreengrocer = shop === "greengrocer" && (
        /chinese|asian|vietnamese|thai|filipino/.test(cuisine) ||
        /asia|sunrise|lucky|viet|pacific|oriental/.test(name)
    );

    const isDeli = shop === "deli" && !isMediterraneanShop;

    // ── Return the ingredient profile ─────────────────────────────────────

    if (isAsianSupermarket) {
        return {
            likely: [
                // Core East Asian pantry — these shops are built around this stock
                "doubanjiang","gochugaru","gochujang","doenjang",
                "miso paste","bonito flakes","dashi stock powder","shaoxing rice wine",
                "dried shiitake mushrooms","enoki mushrooms","wood ear fungus",
                "lotus root","taro root","bitter melon","perilla leaves",
                "chrysanthemum greens","long beans","fermented black beans",
                "dried shrimp","fish sauce","shrimp paste","pandan leaves",
                "lemongrass","kaffir lime leaves","palm sugar","tamarind paste",
            ],
            sometimes: [
                // SE Asian / harder to find even here
                "galangal","yuzu",
                // Cross-cultural items that appear in the world food aisle
                "sumac","zaatar","masa harina","dried hibiscus flowers",
            ],
        };
    }

    if (isSouthAsianGrocery) {
        return {
            likely: [
                "curry leaves","asafoetida","fenugreek seeds","black cardamom",
                "amchur powder","jaggery","chana dal","urad dal",
                "tamarind paste","ajwain seeds","dried shrimp",
                "bitter melon","taro root","long beans",
            ],
            sometimes: [
                "lemongrass","galangal","kaffir lime leaves",
                "dried hibiscus flowers","ancho chili","palm sugar",
            ],
        };
    }

    if (isMediterraneanShop) {
        return {
            likely: [
                "sumac","zaatar","preserved lemons",
                "pomegranate molasses","harissa","barberries",
            ],
            sometimes: [
                "tamarind paste","dried hibiscus flowers","fenugreek seeds",
            ],
        };
    }

    if (isHealthFoodStore) {
        return {
            likely: [
                "miso paste","tamarind paste","teff flour","berbere spice blend",
                "jaggery","chana dal","urad dal","palm sugar",
                "masa harina","dried hibiscus flowers","barberries",
                "fish sauce","lemongrass",
            ],
            sometimes: [
                "gochugaru","gochujang","sumac","zaatar","harissa",
                "preserved lemons","ancho chili","guajillo chili",
                "dried shiitake mushrooms","fenugreek seeds",
            ],
        };
    }

    if (isSouthAsianSpiceShop) {
        return {
            likely: [
                "curry leaves","asafoetida","fenugreek seeds","black cardamom",
                "amchur powder","ajwain seeds","jaggery","tamarind paste",
                "sumac","zaatar","berbere spice blend","gochugaru",
                "ancho chili","guajillo chili","harissa",
            ],
            sometimes: [
                "barberries","dried hibiscus flowers","pomegranate molasses",
            ],
        };
    }

    if (shop === "spices") {
        // General spice shop — mixed world spices, nothing fresh
        return {
            likely: [
                "sumac","zaatar","harissa","fenugreek seeds",
                "berbere spice blend","ancho chili","guajillo chili","gochugaru",
            ],
            sometimes: [
                "asafoetida","black cardamom","amchur powder","ajwain seeds",
                "barberries","dried hibiscus flowers","tamarind paste",
            ],
        };
    }

    if (isAsianGreengrocer) {
        return {
            likely: [
                "lemongrass","galangal","kaffir lime leaves","bitter melon",
                "lotus root","taro root","long beans","chrysanthemum greens",
                "perilla leaves","pandan leaves","curry leaves","enoki mushrooms",
            ],
            sometimes: ["dried shiitake mushrooms","yuzu"],
        };
    }

    if (shop === "greengrocer") {
        // General greengrocer — limited exotics
        return {
            likely: ["lemongrass","taro root","bitter melon"],
            sometimes: ["galangal","kaffir lime leaves","curry leaves","long beans"],
        };
    }

    if (shop === "seafood") {
        return {
            likely: ["dried shrimp","shrimp paste"],
            sometimes: ["fish sauce"],
        };
    }

    if (isDeli) {
        // General deli — small Middle Eastern crossover
        return {
            likely: ["sumac","zaatar","harissa"],
            sometimes: ["preserved lemons","pomegranate molasses","barberries"],
        };
    }

    if (isGeneralSupermarket) {
        // Standard supermarket — world food aisle, limited depth
        return {
            likely: ["fish sauce","tamarind paste","lemongrass"],
            sometimes: [
                "miso paste","dried shiitake mushrooms","gochugaru","taro root",
                "sumac","zaatar","masa harina","dried hibiscus flowers","palm sugar",
            ],
        };
    }

    // Butcher, bakery, cheese, plain convenience — no overlap with our list
    return { likely: [], sometimes: [] };
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_USERS = [
    { name: "Priya Sharma",  email: "priya@example.com",  password: "Password123" },
    { name: "Wei Chen",      email: "wei@example.com",    password: "Password123" },
    { name: "Maria Santos",  email: "maria@example.com",  password: "Password123" },
    { name: "Ahmed Hassan",  email: "ahmed@example.com",  password: "Password123" },
    { name: "Sofia Reyes",   email: "sofia@example.com",  password: "Password123" },
    { name: "James Park",    email: "james@example.com",  password: "Password123" },
];

const SEED_INGREDIENTS = [
    // East Asian
    { name:"Doubanjiang",normalizedName:"doubanjiang",aliases:["spicy bean paste","toban djan","pixian bean paste"],culturalTags:["chinese","sichuan"],categoryTags:["paste","fermented","spicy"],osmCuisineTags:["chinese","asian"],osmShopTags:["supermarket"] },
    { name:"Gochugaru",normalizedName:"gochugaru",aliases:["korean chili flakes","korean red pepper flakes"],culturalTags:["korean"],categoryTags:["spice","chili"],osmCuisineTags:["korean","asian"],osmShopTags:["supermarket"] },
    { name:"Gochujang",normalizedName:"gochujang",aliases:["korean chili paste","korean red pepper paste"],culturalTags:["korean"],categoryTags:["paste","fermented","spicy"],osmCuisineTags:["korean","asian"],osmShopTags:["supermarket"] },
    { name:"Doenjang",normalizedName:"doenjang",aliases:["korean fermented soybean paste"],culturalTags:["korean"],categoryTags:["paste","fermented"],osmCuisineTags:["korean","asian"],osmShopTags:["supermarket"] },
    { name:"Miso Paste",normalizedName:"miso paste",aliases:["shiro miso","aka miso","white miso","red miso"],culturalTags:["japanese"],categoryTags:["paste","fermented"],osmCuisineTags:["japanese","asian"],osmShopTags:["supermarket","health_food"] },
    { name:"Bonito Flakes",normalizedName:"bonito flakes",aliases:["katsuobushi","dashi flakes"],culturalTags:["japanese"],categoryTags:["dried","seafood","stock"],osmCuisineTags:["japanese","asian"],osmShopTags:["supermarket"] },
    { name:"Dashi Stock Powder",normalizedName:"dashi stock powder",aliases:["dashi granules","hondashi","instant dashi"],culturalTags:["japanese"],categoryTags:["stock","powder"],osmCuisineTags:["japanese","asian"],osmShopTags:["supermarket","health_food"] },
    { name:"Shaoxing Rice Wine",normalizedName:"shaoxing rice wine",aliases:["chinese rice wine","shao hsing"],culturalTags:["chinese"],categoryTags:["wine","condiment"],osmCuisineTags:["chinese","asian"],osmShopTags:["supermarket"] },
    { name:"Dried Shiitake Mushrooms",normalizedName:"dried shiitake mushrooms",aliases:["dried mushrooms","dong gu","chinese mushrooms"],culturalTags:["chinese","japanese","korean"],categoryTags:["dried","mushroom"],osmCuisineTags:["chinese","japanese","korean","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Enoki Mushrooms",normalizedName:"enoki mushrooms",aliases:["golden needle mushrooms","enokitake"],culturalTags:["chinese","japanese","korean"],categoryTags:["fresh","mushroom"],osmCuisineTags:["chinese","japanese","korean","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Wood Ear Fungus",normalizedName:"wood ear fungus",aliases:["black fungus","cloud ear","mu er","tree ear"],culturalTags:["chinese"],categoryTags:["dried","mushroom"],osmCuisineTags:["chinese","asian"],osmShopTags:["supermarket"] },
    { name:"Lotus Root",normalizedName:"lotus root",aliases:["lian ou","renkon"],culturalTags:["chinese","japanese","korean"],categoryTags:["fresh","root vegetable"],osmCuisineTags:["chinese","japanese","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Taro Root",normalizedName:"taro root",aliases:["dasheen","arbi","eddoe","kalo"],culturalTags:["chinese","south_asian","caribbean"],categoryTags:["fresh","root vegetable"],osmCuisineTags:["chinese","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Bitter Melon",normalizedName:"bitter melon",aliases:["bitter gourd","karela","goya","ampalaya"],culturalTags:["chinese","south_asian","japanese","filipino"],categoryTags:["fresh","vegetable"],osmCuisineTags:["chinese","japanese","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Perilla Leaves",normalizedName:"perilla leaves",aliases:["sesame leaves","kkaennip","shiso"],culturalTags:["korean","japanese"],categoryTags:["fresh","herb"],osmCuisineTags:["korean","japanese","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Chrysanthemum Greens",normalizedName:"chrysanthemum greens",aliases:["tong ho","shungiku","garland chrysanthemum","crown daisy"],culturalTags:["chinese","japanese","korean"],categoryTags:["fresh","leafy green"],osmCuisineTags:["chinese","japanese","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Long Beans",normalizedName:"long beans",aliases:["yard-long beans","snake beans","dau gok"],culturalTags:["chinese","southeast_asian"],categoryTags:["fresh","vegetable"],osmCuisineTags:["chinese","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Fermented Black Beans",normalizedName:"fermented black beans",aliases:["douchi","salted black beans","preserved black beans"],culturalTags:["chinese"],categoryTags:["fermented","legume"],osmCuisineTags:["chinese","asian"],osmShopTags:["supermarket"] },
    { name:"Dried Shrimp",normalizedName:"dried shrimp",aliases:["hae bee","ebi","camarones secos","dried prawns"],culturalTags:["chinese","southeast_asian","latin_american"],categoryTags:["dried","seafood"],osmCuisineTags:["chinese","asian","mexican"],osmShopTags:["supermarket","seafood"] },
    { name:"Yuzu",normalizedName:"yuzu",aliases:["japanese citrus","yuzu fruit"],culturalTags:["japanese"],categoryTags:["fresh","citrus"],osmCuisineTags:["japanese","asian"],osmShopTags:["supermarket","greengrocer"] },
    // South Asian
    { name:"Curry Leaves",normalizedName:"curry leaves",aliases:["kari patta","meetha neem","kadhi patta"],culturalTags:["south_asian","sri_lankan"],categoryTags:["fresh","herb"],osmCuisineTags:["indian","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Asafoetida",normalizedName:"asafoetida",aliases:["hing","heeng","ferula"],culturalTags:["south_asian"],categoryTags:["spice","powder"],osmCuisineTags:["indian","asian"],osmShopTags:["supermarket","health_food"] },
    { name:"Fenugreek Seeds",normalizedName:"fenugreek seeds",aliases:["methi seeds","hilba","trigonella"],culturalTags:["south_asian","middle_eastern"],categoryTags:["spice","seed"],osmCuisineTags:["indian","asian"],osmShopTags:["supermarket","health_food"] },
    { name:"Black Cardamom",normalizedName:"black cardamom",aliases:["badi elaichi","nepal cardamom","brown cardamom"],culturalTags:["south_asian"],categoryTags:["spice","whole"],osmCuisineTags:["indian","asian"],osmShopTags:["supermarket"] },
    { name:"Amchur Powder",normalizedName:"amchur powder",aliases:["dried mango powder","aamchur","mango powder"],culturalTags:["south_asian"],categoryTags:["spice","powder"],osmCuisineTags:["indian","asian"],osmShopTags:["supermarket"] },
    { name:"Jaggery",normalizedName:"jaggery",aliases:["gur","unrefined cane sugar","panela"],culturalTags:["south_asian"],categoryTags:["sweetener"],osmCuisineTags:["indian","asian"],osmShopTags:["supermarket","health_food"] },
    { name:"Chana Dal",normalizedName:"chana dal",aliases:["split chickpeas","bengal gram dal"],culturalTags:["south_asian"],categoryTags:["legume","dried"],osmCuisineTags:["indian","asian"],osmShopTags:["supermarket","health_food"] },
    { name:"Urad Dal",normalizedName:"urad dal",aliases:["black gram dal","split black lentils"],culturalTags:["south_asian"],categoryTags:["legume","dried"],osmCuisineTags:["indian","asian"],osmShopTags:["supermarket","health_food"] },
    { name:"Tamarind Paste",normalizedName:"tamarind paste",aliases:["imli","tamarindo","asam jawa"],culturalTags:["south_asian","southeast_asian","latin_american"],categoryTags:["paste","souring agent"],osmCuisineTags:["indian","thai","mexican","asian"],osmShopTags:["supermarket"] },
    { name:"Ajwain Seeds",normalizedName:"ajwain seeds",aliases:["carom seeds","bishop's weed","omam"],culturalTags:["south_asian"],categoryTags:["spice","seed"],osmCuisineTags:["indian","asian"],osmShopTags:["supermarket"] },
    // Southeast Asian
    { name:"Lemongrass",normalizedName:"lemongrass",aliases:["citronella","sereh","takrai"],culturalTags:["thai","vietnamese","indonesian","malaysian"],categoryTags:["fresh","herb"],osmCuisineTags:["thai","vietnamese","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Galangal",normalizedName:"galangal",aliases:["thai ginger","blue ginger","laos","kha"],culturalTags:["thai","indonesian","malaysian"],categoryTags:["fresh","root","spice"],osmCuisineTags:["thai","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Kaffir Lime Leaves",normalizedName:"kaffir lime leaves",aliases:["makrut lime leaves","daun limau purut","bai makrut"],culturalTags:["thai","indonesian","malaysian"],categoryTags:["fresh","herb","leaf"],osmCuisineTags:["thai","asian"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Shrimp Paste",normalizedName:"shrimp paste",aliases:["belacan","bagoong","kapi","mam tom","terasi"],culturalTags:["thai","malaysian","filipino","vietnamese","indonesian"],categoryTags:["paste","fermented","seafood"],osmCuisineTags:["thai","asian"],osmShopTags:["supermarket"] },
    { name:"Palm Sugar",normalizedName:"palm sugar",aliases:["coconut sugar","gula melaka","nam tan peep"],culturalTags:["thai","indonesian","malaysian"],categoryTags:["sweetener"],osmCuisineTags:["thai","asian"],osmShopTags:["supermarket","health_food"] },
    { name:"Pandan Leaves",normalizedName:"pandan leaves",aliases:["screwpine leaves","daun pandan","bai toey"],culturalTags:["filipino","thai","malaysian","indonesian"],categoryTags:["fresh","leaf","flavouring"],osmCuisineTags:["thai","asian"],osmShopTags:["supermarket"] },
    { name:"Fish Sauce",normalizedName:"fish sauce",aliases:["nam pla","nuoc mam","patis","tiparos"],culturalTags:["thai","vietnamese","filipino"],categoryTags:["condiment","fermented","seafood"],osmCuisineTags:["thai","vietnamese","asian"],osmShopTags:["supermarket"] },
    // Middle Eastern
    { name:"Sumac",normalizedName:"sumac",aliases:["sumak","rhus coriaria"],culturalTags:["middle_eastern","mediterranean"],categoryTags:["spice","souring agent"],osmCuisineTags:["middle_eastern","mediterranean"],osmShopTags:["supermarket","spices","deli"] },
    { name:"Za'atar",normalizedName:"zaatar",aliases:["zaatar spice blend","zatar","za'tar"],culturalTags:["middle_eastern","mediterranean"],categoryTags:["spice blend","herb"],osmCuisineTags:["middle_eastern","mediterranean"],osmShopTags:["supermarket","spices","deli"] },
    { name:"Preserved Lemons",normalizedName:"preserved lemons",aliases:["pickled lemons","moroccan preserved lemons"],culturalTags:["middle_eastern","north_african"],categoryTags:["preserved","condiment"],osmCuisineTags:["middle_eastern","mediterranean"],osmShopTags:["supermarket","deli"] },
    { name:"Pomegranate Molasses",normalizedName:"pomegranate molasses",aliases:["dibs al-rumman","nar eksisi"],culturalTags:["middle_eastern","persian"],categoryTags:["condiment","souring agent"],osmCuisineTags:["middle_eastern"],osmShopTags:["supermarket","deli","health_food"] },
    { name:"Harissa",normalizedName:"harissa",aliases:["harissa paste","harrisa"],culturalTags:["north_african","middle_eastern"],categoryTags:["paste","spicy","condiment"],osmCuisineTags:["middle_eastern","mediterranean"],osmShopTags:["supermarket","deli"] },
    { name:"Barberries",normalizedName:"barberries",aliases:["zereshk","berberis","dried barberries"],culturalTags:["persian","middle_eastern"],categoryTags:["dried","fruit","souring agent"],osmCuisineTags:["middle_eastern"],osmShopTags:["supermarket","health_food"] },
    // Latin American
    { name:"Masa Harina",normalizedName:"masa harina",aliases:["corn flour for tortillas","nixtamal flour","tortilla flour"],culturalTags:["mexican","latin_american"],categoryTags:["flour","dried"],osmCuisineTags:["mexican"],osmShopTags:["supermarket"] },
    { name:"Epazote",normalizedName:"epazote",aliases:["mexican tea","wormseed","pazote"],culturalTags:["mexican"],categoryTags:["fresh","herb","dried"],osmCuisineTags:["mexican"],osmShopTags:["supermarket","greengrocer"] },
    { name:"Ancho Chili",normalizedName:"ancho chili",aliases:["dried poblano","chile ancho","ancho chile"],culturalTags:["mexican"],categoryTags:["dried","chili"],osmCuisineTags:["mexican"],osmShopTags:["supermarket","spices"] },
    { name:"Guajillo Chili",normalizedName:"guajillo chili",aliases:["chile guajillo","dried mirasol chile","guajillo"],culturalTags:["mexican"],categoryTags:["dried","chili"],osmCuisineTags:["mexican"],osmShopTags:["supermarket","spices"] },
    { name:"Piloncillo",normalizedName:"piloncillo",aliases:["panela","raw cane sugar cone","rapadura"],culturalTags:["mexican","latin_american"],categoryTags:["sweetener"],osmCuisineTags:["mexican"],osmShopTags:["supermarket"] },
    { name:"Dried Hibiscus Flowers",normalizedName:"dried hibiscus flowers",aliases:["flor de jamaica","sobolo","bissap","karkade","roselle"],culturalTags:["mexican","west_african","middle_eastern"],categoryTags:["dried","flower","tea"],osmCuisineTags:["mexican","african"],osmShopTags:["supermarket","health_food"] },
    // East African
    { name:"Berbere Spice Blend",normalizedName:"berbere spice blend",aliases:["ethiopian spice mix","berbere"],culturalTags:["ethiopian","east_african"],categoryTags:["spice blend"],osmCuisineTags:["african"],osmShopTags:["supermarket","spices","health_food"] },
    { name:"Teff Flour",normalizedName:"teff flour",aliases:["teff grain flour","injera flour"],culturalTags:["ethiopian"],categoryTags:["flour","grain"],osmCuisineTags:["african"],osmShopTags:["supermarket","health_food"] },
];

// ─── Seed functions ───────────────────────────────────────────────────────────

async function clearCollections() {
    console.log("  Clearing existing data…");
    await Promise.all([
        User.deleteMany({}), Ingredient.deleteMany({}), Vendor.deleteMany({}),
        Receipt.deleteMany({}), IngredientRequest.deleteMany({}),
    ]);
}

async function seedUsers() {
    console.log("  Seeding users…");
    const users = await Promise.all(SEED_USERS.map(async ({ name, email, password }) => {
        const normalizedEmail = email.toLowerCase();
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        return User.create({ name, email, normalizedEmail, passwordHash });
    }));
    console.log(`    ✓ ${users.length} users`);
    return users;
}

async function seedIngredients() {
    console.log("  Seeding ingredients…");
    const ingredients = await Ingredient.insertMany(SEED_INGREDIENTS);
    console.log(`    ✓ ${ingredients.length} ingredients`);
    return ingredients;
}

async function fetchAndSeedVendors() {
    console.log("  Fetching real vendors from Overpass…");
    const allVendors = [];

    for (const hood of NEIGHBOURHOODS) {
        process.stdout.write(`    • ${hood.name}… `);
        const vendors = await fetchVendorsForNeighbourhood(hood);

        // De-duplicate by osmId within this neighbourhood, take up to 8.
        const seen = new Set();
        const unique = vendors.filter(v => {
            if (seen.has(v.osmId)) return false;
            seen.add(v.osmId);
            return true;
        }).slice(0, 8);

        console.log(`${unique.length} vendors found`);
        allVendors.push(...unique);

        if (hood !== NEIGHBOURHOODS.at(-1)) await sleep(1200); // be polite to Overpass
    }

    if (allVendors.length === 0) {
        throw new Error("Overpass returned no vendors. Check your internet connection and try again.");
    }

    // Upsert so the script is re-runnable without duplicate-key errors.
    const ops = allVendors.map(v => ({
        updateOne: {
            filter: { osmId: v.osmId },
            update: { $set: { osmId: v.osmId, name: v.name, neighbourhood: v.neighbourhood } },
            upsert: true,
        },
    }));
    await Vendor.bulkWrite(ops);
    console.log(`    ✓ ${allVendors.length} vendors upserted`);
    return allVendors;
}

async function seedReceiptsAndRequests(users, ingredients, vendors) {
    const ingredientByName = Object.fromEntries(ingredients.map(i => [i.normalizedName, i]));

    // ── Receipts ──────────────────────────────────────────────────────────
    console.log("  Seeding receipts…");
    const receipts = [];
    const seen = new Set();

    for (const vendor of vendors) {
        const { likely, sometimes } = getVendorProfile(vendor.tags);

        // Skip vendors with no relevant stock (butchers, bakeries, etc.)
        if (likely.length === 0 && sometimes.length === 0) continue;

        for (const user of users) {
            // Every user reports on all "likely" items — these are the shop's
            // core stock and any regular shopper would know about them.
            const likelySample = likely;

            // For "sometimes" items, each user only checks a random subset —
            // not every shopper goes looking for every niche item.
            const sometimesSample = sometimes
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.ceil(sometimes.length * 0.6));

            for (const [normalizedName, isLikely] of [
                ...likelySample.map(n => [n, true]),
                ...sometimesSample.map(n => [n, false]),
            ]) {
                const ingredient = ingredientByName[normalizedName];
                if (!ingredient) continue;

                const key = `${user._id}-${vendor.osmId}-${ingredient._id}`;
                if (seen.has(key)) continue;
                seen.add(key);

                // "likely" items are found ~88% of the time — reliable stock.
                // "sometimes" items are found ~40% — niche or intermittent stock.
                const found = Math.random() < (isLikely ? 0.88 : 0.40);

                receipts.push({
                    userId:       user._id,
                    vendorOsmId:  vendor.osmId,
                    ingredientId: ingredient._id,
                    found,
                    createdAt:    randomRecentDate(60),
                });
            }
        }
    }

    await Receipt.insertMany(receipts, { ordered: false });
    console.log(`    ✓ ${receipts.length} receipts`);

    // ── Ingredient Requests ───────────────────────────────────────────────
    console.log("  Seeding ingredient requests…");

    // Build one "hard to find" request per neighbourhood per user for an
    // ingredient that isn't obviously stocked there.
    const hardToFind = {
        "Chinatown":        ["yuzu","berbere spice blend","epazote","teff flour","barberries","piloncillo"],
        "Commercial Drive": ["doenjang","asafoetida","urad dal","bonito flakes","black cardamom","pandan leaves"],
        "Punjabi Market":   ["miso paste","galangal","kaffir lime leaves","bonito flakes","guajillo chili","shrimp paste"],
        "Kitsilano":        ["doubanjiang","wood ear fungus","lotus root","fermented black beans","chrysanthemum greens","ajwain seeds"],
    };

    const requestDocs = [];
    const reqSeen = new Set();

    for (const [hood, ingredients_list] of Object.entries(hardToFind)) {
        for (let i = 0; i < users.length; i++) {
            const ingName    = ingredients_list[i % ingredients_list.length];
            const ingredient = ingredientByName[ingName];
            if (!ingredient) continue;

            const key = `${users[i]._id}-${ingredient._id}-${hood}`;
            if (reqSeen.has(key)) continue;
            reqSeen.add(key);

            requestDocs.push({
                userId:       users[i]._id,
                ingredientId: ingredient._id,
                neighbourhood: hood,
                createdAt:    randomRecentDate(45),
            });
        }
    }

    await IngredientRequest.insertMany(requestDocs);
    console.log(`    ✓ ${requestDocs.length} ingredient requests`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
    console.log("\n🌱 Cabbage Patch seed script (live Overpass data)");
    console.log("─".repeat(50));

    await connectToDatabase();
    if (CLEAR_FIRST) await clearCollections();

    const users       = await seedUsers();
    const ingredients = await seedIngredients();
    const vendors     = await fetchAndSeedVendors();
    await seedReceiptsAndRequests(users, ingredients, vendors);

    console.log("─".repeat(50));
    console.log("✅ Seed complete.\n");
    console.log("Seed user credentials (all passwords: Password123):");
    SEED_USERS.forEach(u => console.log(`  ${u.email}`));
    console.log();

    process.exit(0);
}

main().catch(err => {
    console.error("\n❌ Seed failed:", err.message);
    process.exit(1);
});
