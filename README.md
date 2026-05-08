# Cabbage Patch (Ingredient Finder)

A web application designed to reduce the difficulty of finding specific, culturally important, or hard-to-find cooking
ingredients in Vancouver and nearby Canadian communities.

The app's core idea is:

> External vendor data can suggest possible stores. Our app's user reports provide the ingredient-specific truth layer.

This README is meant to be both a setup guide and a teaching/reference document. It should help backend, frontend, and
demo contributors understand what currently exists, how to run it, how data moves through the app, and what is
intentionally not built yet.

---

## Current branch status

This repo has been reset into a clean starter structure.

Earlier team experiments have been preserved under `reference/` so they are not lost, but they are not imported by the
active app.

The current clean app includes:

- An Express backend entry point.
- A health-check API route.
- A local demo of `GET /api/search/vendors`.
- A mock vendor provider.
- A minimal frontend search page.
- A frontend API helper.
- A vendor-card renderer.

The current clean app does not include:

- A real OpenStreetMap/Overpass API connection.
- A real Google Places API connection.
- A real MongoDB read/write flow.
- User accounts.
- Saved reports.
- Saved ingredient requests.
- Leaflet map rendering.
- Persistent storage of any kind.

At this stage, the project is a teaching/demo skeleton for the search flow.

---

## What this currently does

The current app lets a user type an ingredient and location into a basic search form.

When the form is submitted, the frontend calls a local backend route:

```txt
GET /api/search/vendors
```

The backend then calls a local mock provider, receives mock vendor objects, normalizes them into the shape the frontend
expects, and sends them back as JSON.

The frontend receives that JSON and renders vendor cards.

Current flow:

```txt
frontend/index.html
  -> frontend/js/app.js
  -> frontend/js/ui/searchForm.js
  -> frontend/js/api/vendorApi.js
  -> GET /api/search/vendors
  -> backend/routes/searchRoutes.js
  -> backend/controllers/searchController.js
  -> backend/services/searchService.js
  -> backend/providers/activeVendorProvider.js
  -> backend/providers/mockVendorProvider.js
  -> backend/utils/normalizeVendor.js
  -> backend/utils/buildIngredientStatus.js
  -> JSON response
  -> frontend/js/ui/vendorCards.js
  -> visible vendor cards
```

The point of this flow is to prove the shape of the app before connecting real external data or database persistence.

---

## What this currently does not do

This current branch does not search the internet.

It does not call OpenStreetMap, Overpass, Google Places, or any third-party API.

It does not save anything to MongoDB.

It does not save anything locally.

It does not write to JSON files.

It does not use `localStorage`.

It does not create reports, requests, users, sessions, or accounts.

It does not prove that the final database design works.

It only proves this:

```txt
A frontend form can call our backend.
The backend can return a stable vendor-search response.
The frontend can render that response.
The backend is structured so a real provider can replace the mock provider later.
```

---

## Why the app starts with mock data

The app starts with mock data because the backend/frontend contract needs to be stable before we connect real external
APIs.

Mock data lets us build and test:

- The search form.
- The backend route.
- The service layer.
- Provider selection.
- Vendor normalization.
- Frontend API helpers.
- Vendor card rendering.
- Future report/status display shapes.

This avoids blocking frontend work on API keys, rate limits, Overpass query syntax, Google billing, database setup, or
network problems.

The mock provider is not the final data source. It is a safe development provider.

---

## Run locally

### 1. Install dependencies

```bash
npm install
```

This installs the backend dependencies listed in `package.json`.

Do not commit `node_modules/`. It should be recreated locally by running `npm install`.

---

### 2. Create a local environment file

```bash
cp .env.example .env
```

The `.env` file is where local machine-specific settings go.

Example:

```txt
PORT=3000
MONGODB_URI=
ACTIVE_VENDOR_PROVIDER=mock
```

For the current mock-only demo, `MONGODB_URI` can stay blank.

The server is designed to still run without a database connection because the current search route does not read from or
write to MongoDB yet.

---

### 3. Start the server

```bash
npm run dev
```

This runs:

```bash
node backend/server.js
```

That means `backend/server.js` is the process entry point.

---

### 4. Open the frontend

```txt
http://localhost:3000
```

This loads the static frontend served by Express.

If this page works, it proves:

```txt
The server is running.
Express is serving the frontend folder.
frontend/index.html can load.
The browser can load the linked frontend CSS and JavaScript files.
```

If this page does not work, check whether the server is running and whether the terminal shows startup errors.

---

### 5. Test the backend health route

```txt
http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "ingredient-finder-api"
}
```

This route is a backend pulse check.

If `/api/health` works, it proves:

```txt
The Express server is running.
The API routes are mounted.
The backend can respond to requests.
```

If `/` does not work but `/api/health` does work, the server is alive and the issue is likely with the frontend/static
file path, `frontend/index.html`, or frontend asset loading.

If both `/` and `/api/health` show a browser-level error such as:

```txt
This site can't be reached
ERR_CONNECTION_REFUSED
```

then the Express server is probably not running, is running on a different port, or crashed during startup.

Important: `/api/health` cannot tell you the server is down by returning JSON. If the server is truly not reachable, the
browser fails before our backend code can respond.

---

### 6. Test the search API directly

```txt
http://localhost:3000/api/search/vendors?ingredient=Oaxaca%20cheese&location=Vancouver
```

This calls the current mock vendor-search route directly in the browser.

Expected response shape:

```json
{
  "ingredient": {
    "id": "mock-oaxaca-cheese",
    "name": "Oaxaca cheese",
    "normalizedName": "oaxaca cheese"
  },
  "searchLocation": {
    "label": "Vancouver",
    "lat": null,
    "lng": null
  },
  "vendors": [
    {
      "id": "mock-vendor-001",
      "name": "Example Vendor Name",
      "address": "Example Vendor Address",
      "lat": 49.2827,
      "lng": -123.1207,
      "source": "mock",
      "categories": [
        "grocery"
      ],
      "externalIds": {
        "googlePlaceId": null,
        "osmType": null,
        "osmId": null
      },
      "ingredientStatus": {
        "status": "UNKNOWN",
        "lastConfirmedAt": null,
        "foundCount": 0,
        "notFoundCount": 0
      }
    }
  ]
}
```

If this route works, it proves:

```txt
The search route is mounted.
The search controller is receiving query parameters.
The search service is calling the active provider.
The mock provider is returning data.
The backend is returning the normalized search response shape.
```

It does not prove:

```txt
OpenStreetMap works.
Google Places works.
MongoDB works.
Reports are saved.
Requests are saved.
The map works.
```

---

## Diagnostic guide

Use this when something is broken.

### Case 1: `/` and `/api/health` both fail with `ERR_CONNECTION_REFUSED`

Likely meaning:

```txt
The server is not running, crashed, or is running on a different port.
```

What to check:

```bash
npm run dev
```

Then look at the terminal output.

---

### Case 2: `/api/health` works, but `/` fails

Likely meaning:

```txt
The backend server is running, but the frontend static file serving is broken.
```

What to check:

```txt
backend/app.js
frontend/index.html
frontend file paths
Express static folder configuration
```

---

### Case 3: `/` works, but clicking Search fails

Likely meaning:

```txt
The frontend is loading, but the search API call or render flow has a problem.
```

What to check:

```txt
Browser console
frontend/js/ui/searchForm.js
frontend/js/api/vendorApi.js
/api/search/vendors response
```

---

### Case 4: `/api/health` works, but `/api/search/vendors` fails

Likely meaning:

```txt
The backend is alive, but the search route/controller/service/provider chain has a problem.
```

What to check:

```txt
backend/routes/searchRoutes.js
backend/controllers/searchController.js
backend/services/searchService.js
backend/providers/activeVendorProvider.js
backend/providers/mockVendorProvider.js
```

---

## Current file tree

```txt
.
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── healthController.js
│   │   └── searchController.js
│   ├── providers/
│   │   ├── activeVendorProvider.js
│   │   └── mockVendorProvider.js
│   ├── routes/
│   │   ├── healthRoutes.js
│   │   └── searchRoutes.js
│   ├── services/
│   │   └── searchService.js
│   └── utils/
│       ├── buildIngredientStatus.js
│       ├── normalizeIngredientName.js
│       └── normalizeVendor.js
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── api/
│       │   └── vendorApi.js
│       └── ui/
│           ├── searchForm.js
│           └── vendorCards.js
├── reference/
│   ├── kept-prototypes/
│   └── trash-candidates/
├── .env.example
├── .gitignore
├── CLEAN_START_CHANGELOG.md
├── package.json
├── package-lock.json
└── README.md
```

---

## File-by-file walkthrough

### `backend/server.js`

This is the backend process entry point.

Use this file when you want to understand how the server starts.

It is responsible for:

```txt
Loading environment variables.
Connecting to the database if a MongoDB URI exists.
Starting Express on the configured port.
```

It should not contain route definitions or business logic.

---

### `backend/app.js`

This creates and configures the Express app.

Use this file when you want to understand what middleware and route groups are mounted.

It is responsible for:

```txt
Creating the Express app.
Allowing JSON request bodies.
Serving the frontend folder.
Mounting /api/health.
Mounting /api/search.
```

It should not call `app.listen()`. That belongs in `server.js`.

---

### `backend/config/env.js`

This is the central place for environment config.

Use this file when you need to add a new environment variable.

Example:

```js
export const env = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI || '',
    activeVendorProvider: process.env.ACTIVE_VENDOR_PROVIDER || 'mock',
};
```

The reason this file exists is to avoid scattering `process.env` throughout the app.

---

### `backend/config/db.js`

This owns MongoDB connection setup.

Use this file when database persistence is added.

For the current mock-only demo, the app can run without `MONGODB_URI`.

That is intentional. The current app should teach and demonstrate the backend/frontend flow before requiring database
setup.

---

### `backend/routes/healthRoutes.js`

This defines the health-check route.

Use this file when checking which controller handles `/api/health`.

Route files should stay small. They should connect URLs to controller functions, not contain app logic.

---

### `backend/controllers/healthController.js`

This returns the health-check JSON response.

Use this file when changing what `/api/health` returns.

This controller should stay simple because the health route is only a pulse check.

---

### `backend/routes/searchRoutes.js`

This defines the vendor-search route.

Current route:

```txt
GET /api/search/vendors
```

Use this file when checking which controller handles vendor search.

---

### `backend/controllers/searchController.js`

This handles HTTP request/response details for vendor search.

It reads query parameters from the request, calls the search service, and sends JSON back to the frontend.

Use this file when you need to understand the API inputs.

Current query parameters:

```txt
ingredient
location
lat
lng
```

Example:

```txt
/api/search/vendors?ingredient=Oaxaca%20cheese&location=Vancouver
```

The controller should not know how mock data, OpenStreetMap, Google Places, or MongoDB work. That belongs below the
controller layer.

---

### `backend/services/searchService.js`

This owns the current search workflow.

Use this file when you want to understand the business logic of a vendor search.

Current responsibilities:

```txt
Validate and normalize the ingredient name.
Call the active vendor provider.
Normalize the response shape.
Attach placeholder ingredient status.
Return the final search response.
```

Later, this is where MongoDB enrichment can be added.

For example, the future service can:

```txt
Find or create the ingredient.
Upsert vendors from provider results.
Fetch reports for the ingredient/vendor pairs.
Build real FOUND / NOT_FOUND status summaries.
Return enriched vendors.
```

---

### `backend/providers/activeVendorProvider.js`

This selects which vendor provider the app should use.

Use this file when switching between mock data, OpenStreetMap/Overpass, or Google Places.

Current provider:

```txt
mock
```

The reason this file exists is so the rest of the backend can call one provider interface without caring where vendor
data came from.

The frontend should never import or reference this file directly.

---

### `backend/providers/mockVendorProvider.js`

This is the current local vendor data provider.

Use this file when you need predictable demo data.

It returns vendor-like objects without calling any external API or database.

This is the file to compare against when building a future `overpassVendorProvider.js`. The Overpass provider should
return the same kind of normalized provider result so the rest of the app does not need to change.

---

### `backend/utils/normalizeIngredientName.js`

This normalizes ingredient search text.

Use it when comparing, deduping, or storing ingredient names.

Example:

```txt
"  Oaxaca   Cheese " -> "oaxaca cheese"
```

The reason this helper exists is so normalization is consistent everywhere instead of reimplemented differently in
multiple files.

---

### `backend/utils/normalizeVendor.js`

This turns provider vendor data into the stable frontend-facing vendor shape.

Use this helper inside provider/search workflows before returning vendors to the frontend.

The frontend should be able to rely on fields like:

```txt
id
name
address
lat
lng
source
categories
externalIds
ingredientStatus
```

The reason this helper exists is to protect the frontend from provider-specific data shapes.

---

### `backend/utils/buildIngredientStatus.js`

This currently returns placeholder ingredient status.

Current status:

```txt
UNKNOWN
```

Current counts:

```txt
foundCount: 0
notFoundCount: 0
```

Later, this should use real report data to summarize whether an ingredient was recently found or not found at a vendor.

This file exists now so the response shape already matches the future contract.

---

### `frontend/index.html`

This is the current user-facing page.

Use this page to manually test the search form and rendered vendor cards.

It does not contain vendor data itself. It loads JavaScript that calls the backend.

---

### `frontend/js/app.js`

This is the frontend JavaScript entry point.

It currently initializes the search form behavior.

It should stay small.

If this file starts filling with business logic, that logic probably belongs in a more specific file under `api/`,`ui/`,
`map/`, or `utils/`.

---

### `frontend/js/api/vendorApi.js`

This is the frontend helper for vendor-search API calls.

Use this function when frontend code needs vendor search results.

The UI should call this helper instead of writing raw `fetch()` calls everywhere.

The reason this file exists is to keep backend endpoint details in one place.

---

### `frontend/js/ui/searchForm.js`

This owns search-form behavior.

It reads input values, calls `vendorApi.js`, and passes returned vendors to the card renderer.

It should not know how the backend finds vendors.

It should not contain mock data.

---

### `frontend/js/ui/vendorCards.js`

This renders vendor cards from normalized vendor objects.

Use this file when changing how vendor search results appear on the page.

It should receive data and render HTML. It should not call the backend directly.

---

## Backend response contract

The frontend should expect vendor search responses to use this shape:

```js
{
    ingredient: {
        id: string,
            name
    :
        string,
            normalizedName
    :
        string
    }
,
    searchLocation: {
        label: string,
            lat
    :
        number | null,
            lng
    :
        number | null
    }
,
    vendors: [
        {
            id: string,
            name: string,
            address: string,
            lat: number | null,
            lng: number | null,
            source: string,
            categories: string[],
            externalIds: {
                googlePlaceId: string | null,
                osmType: string | null,
                osmId: string | null
            },
            ingredientStatus: {
                status: 'UNKNOWN' | 'FOUND' | 'NOT_FOUND',
                lastConfirmedAt: string | null,
                foundCount: number,
                notFoundCount: number
            }
        }
    ]
}
```

Frontend code should use this shape instead of relying on provider-specific fields.

---

## Provider contract

Vendor providers should act like interchangeable adapters.

A provider should accept search context such as:

```js
{
    ingredientName,
        normalizedIngredientName,
        locationText,
        coordinates
}
```

A provider should return vendor-like objects that can be normalized into the backend response contract.

Current provider:

```txt
backend/providers/mockVendorProvider.js
```

Future provider:

```txt
backend/providers/overpassVendorProvider.js
```

The frontend should not change when the active provider changes.

That is the main architecture rule of this branch.

---

## Preserved prototype work

See:

```txt
reference/README.md
```

Earlier Google Places samples and search experiments were kept because they may be useful later.

Broken, misleading, or obsolete experiments were moved into:

```txt
reference/trash-candidates/
```

Those files are not active app files.

Do not import from `reference/` in active app code.

If a reference file becomes useful, copy the idea into the proper backend/frontend structure and rewrite it to match the
current architecture.

---

## Next recommended task

Build the OpenStreetMap/Overpass provider as a new adapter without changing the frontend contract.

Suggested target file:

```txt
backend/providers/overpassVendorProvider.js
```

The provider should return the same normalized vendor shape currently returned by `mockVendorProvider.js`.

The goal is not to redesign the frontend.

The goal is:

```txt
Change provider behavior behind the backend contract.
Keep the frontend API call the same.
Keep the frontend render logic the same.
```

