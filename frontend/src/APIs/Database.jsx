// In production this points at the Render backend; in dev the Vite proxy handles /db locally.
const BASE_URL = (import.meta.env.VITE_API_URL ?? "/db").replace(/\/$/, "");

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function loginUser(email, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.user;
}

export async function registerUser(name, email, password) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.user;
}

export async function logoutUser() {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });
    if (!response.ok) {
        const data = await response.json();
        throw { status: response.status, message: data.message };
    }
}

export async function refreshToken() {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
    });
    if (!response.ok) throw { status: response.status, message: "Session expired." };
}

/**
 * Returns the currently authenticated user using the access token cookie,
 * or throws if the user is not authenticated.
 */
export async function getMe() {
    const response = await fetch(`${BASE_URL}/auth/me`, {
        credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.user;
}

// ─── Unified Search ───────────────────────────────────────────────────────────

/**
 * Single call that returns everything needed to tier-rank vendors:
 *   ingredient      — best-matching ingredient doc, or null
 *   osmCuisineTags  — e.g. ["korean", "asian"]
 *   osmShopTags     — e.g. ["supermarket"]
 *   vendorSightings — [{ vendorOsmId, foundCount, notFoundCount }]
 *   query           — echoed back
 */
export async function unifiedSearch(query) {
    const response = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
        { credentials: "include" }
    );
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data;
}

// ─── Ingredients ─────────────────────────────────────────────────────────────

/**
 * Search ingredients by name, alias, or tag.
 * Returns an array of ingredient objects, best match first.
 */
export async function searchIngredients(query) {
    const response = await fetch(
        `${BASE_URL}/ingredients/search?q=${encodeURIComponent(query)}`,
        { credentials: "include" }
    );
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.ingredients; // [{ _id, name, osmCuisineTags, osmShopTags, ... }]
}

/**
 * Creates a new ingredient in the database.
 * On a 409 (already exists) the existing ingredient is returned so the
 * caller can treat it as a successful selection.
 */
export async function createIngredient(name) {
    const response = await fetch(`${BASE_URL}/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
    });

    // Guard against non-JSON responses (e.g. unregistered route, proxy error,
    // or server not running) so the error message is readable.
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
        throw { status: response.status, message: `Server error (${response.status}) — make sure the backend is running.` };
    }

    const data = await response.json();
    // 409 means it already exists — return the existing ingredient as a hit.
    if (response.status === 409) return data.ingredient;
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.ingredient;
}

// ─── Receipts (Sightings) ─────────────────────────────────────────────────────

/**
 * Log that the current user found (or didn't find) an ingredient at a vendor.
 * @param {string} vendorOsmId  — e.g. "node-12345678"
 * @param {string} ingredientId — MongoDB ObjectId string
 * @param {boolean} found
 */
export async function logSighting(vendorOsmId, ingredientId, found) {
    const response = await fetch(`${BASE_URL}/receipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ vendorOsmId, ingredientId, found }),
    });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.receipt;
}

/**
 * Returns per-vendor sighting counts for a given ingredient.
 * Used to power the "Confirmed purchase" filter.
 * @returns {Array<{ vendorOsmId, foundCount, notFoundCount }>}
 */
export async function getVendorSightingsForIngredient(ingredientId) {
    const response = await fetch(
        `${BASE_URL}/receipts/ingredient/${ingredientId}/vendors`,
        { credentials: "include" }
    );
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.vendors;
}

/**
 * Returns per-ingredient sighting counts for a given vendor.
 * @returns {Array<{ ingredientId, ingredientName, foundCount, notFoundCount }>}
 */
export async function getIngredientSightingsForVendor(osmId) {
    const response = await fetch(
        `${BASE_URL}/receipts/vendor/${encodeURIComponent(osmId)}`,
        { credentials: "include" }
    );
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.ingredients;
}

/**
 * Returns the current user's receipt history.
 */
export async function getMyReceipts() {
    const response = await fetch(`${BASE_URL}/receipts/mine`, { credentials: "include" });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.receipts;
}

/**
 * Deletes one of the current user's receipts.
 */
export async function deleteReceipt(receiptId) {
    const response = await fetch(`${BASE_URL}/receipts/${receiptId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) {
        const data = await response.json();
        throw { status: response.status, message: data.message };
    }
}

// ─── Ingredient Requests ──────────────────────────────────────────────────────

/**
 * Creates a request: "I'm looking for this ingredient in this neighbourhood."
 * @param {string} ingredientId
 * @param {string} neighbourhood — e.g. "Kitsilano"
 */
export async function createIngredientRequest(ingredientId, neighbourhood) {
    const response = await fetch(`${BASE_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ingredientId, neighbourhood }),
    });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.request;
}

/**
 * Returns all ingredient requests, optionally filtered by neighbourhood or ingredientId.
 */
export async function getIngredientRequests({ neighbourhood, ingredientId } = {}) {
    const params = new URLSearchParams();
    if (neighbourhood) params.set("neighbourhood", neighbourhood);
    if (ingredientId) params.set("ingredientId", ingredientId);

    const response = await fetch(`${BASE_URL}/requests?${params}`, { credentials: "include" });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.requests;
}

/**
 * Returns the current user's ingredient requests.
 */
export async function getMyIngredientRequests() {
    const response = await fetch(`${BASE_URL}/requests/mine`, { credentials: "include" });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data.requests;
}

/**
 * Returns neighbourhood demand summary for an ingredient.
 * @returns {{ neighbourhoods: Array<{ neighbourhood, count }>, total: number }}
 */
export async function getRequestSummaryForIngredient(ingredientId) {
    const response = await fetch(
        `${BASE_URL}/requests/ingredient/${ingredientId}/summary`,
        { credentials: "include" }
    );
    const data = await response.json();
    if (!response.ok) throw { status: response.status, message: data.message };
    return data;
}

/**
 * Deletes one of the current user's ingredient requests.
 */
export async function deleteIngredientRequest(requestId) {
    const response = await fetch(`${BASE_URL}/requests/${requestId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) {
        const data = await response.json();
        throw { status: response.status, message: data.message };
    }
}
