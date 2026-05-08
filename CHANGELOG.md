# Changelog

_Last updated: 2026-05-08_

## Purpose

This changelog documents a cleanup pass performed on the initial `dev` branch snapshot for the Ingredient Finder project.

The goal of this cleanup was to preserve useful team work, quarantine misleading or obsolete experiments, and create a clean project structure to work off going forward.

Core cleanup principle:

> Working or informative prototype code is preserved as reference. Confusing, broken, or obsolete code is parked clearly. Active app code starts fresh.

---

## High-Level Summary

The original repo was treated as prototype material rather than the foundation of the final app.

The cleaned version does three things:

```txt
1. Parks useful team work under reference/kept-prototypes/
2. Parks misleading, broken, obsolete, or out-of-scope team work under reference/trash-candidates/
3. Creates a fresh backend/frontend structure for the real app
```

The active app now starts with a simple demo vendor search flow using a mock provider.

The active frontend also includes project favicon support so the browser tab has a clear app identity during demos and local testing.

The current working flow is:

```txt
frontend search form
  -> frontend/js/api/vendorApi.js
  -> GET /api/search/vendors
  -> backend/controllers/searchController.js
  -> backend/services/searchService.js
  -> backend/providers/activeVendorProvider.js
  -> backend/providers/mockVendorProvider.js
  -> normalized vendor response
  -> frontend/js/ui/vendorCards.js
```

---

## Root-Level Changes

### Added

```txt
backend/
frontend/
reference/
.env.example
```

Frontend asset support added:

```txt
frontend/assets/
```

### Replaced

```txt
README.md
package.json
package-lock.json
.gitignore
```

### Removed From the Original Repo

These original root files/folders are no longer active app files :

```txt
googleMapsApiTest/
loginDbConnection/
node_modules/
about.html
```

Their useful contents have been preserved under `reference/`.

---

## Original File Preservation Map

### `googleMapsApiTest/testData.json`

Moved to:

```txt
reference/kept-prototypes/google-places-raw-sample/googlePlacesRawSample.json
```

Why kept:

This file contains the valuable 10-vendor Google Places sample. Even though the MVP is pivoting away from Google Places, this data is still useful as reference material for what external provider payloads can look like.

Why not active:

Google Places is not the immediate provider target. The active app should use a mock provider first, then OpenStreetMap/Overpass.

Future use:

Use this later when designing or testing a `googlePlacesVendorProvider.js` and a `normalizeGooglePlaceToVendor()` helper.

---

### `googleMapsApiTest/explanation.txt`

Moved to:

```txt
reference/kept-prototypes/google-places-raw-sample/googlePlacesIdNotes.txt
```

Why kept:

It maps vendor/store names to Google Place IDs.

Why not active:

Human notes are reference material, not runtime app code.

Future use:

Useful if someone later revisits Google Places and wants known sample place IDs.

---

### `googleMapsApiTest/locationDataParser.js`

Moved to:

```txt
reference/kept-prototypes/google-places-raw-sample/locationDataParser.prototype.js
```

Why kept:

It contains the seed of useful logic: pulling selected vendor/location fields from stored provider data.

Why not active:

It is tied to the old Google test database shape and does not fit the new provider/service architecture.

Future use:

Use as reference when writing provider-specific normalization code, not as active app code.

---

### `googleMapsApiTest/apiTest.html`

Moved to:

```txt
reference/kept-prototypes/search-ui-prototype/apiTest.prototype.html
```

Why kept:

It shows early search-normalization and result-display thinking.

Why not active:

The frontend should not hold fake database data directly inside a page. The new frontend should call backend API helpers.

Future use:

Can be referenced for basic UI/search interaction ideas only.

---

### `googleMapsApiTest/apiTest.js`

Moved to:

```txt
reference/kept-prototypes/search-ui-prototype/apiTestServer.prototype.js
```

Why kept:

It was an early Express/static-file serving proof.

Why not active:

It is not a real backend entry point. The cleaned backend now uses:

```txt
backend/server.js
backend/app.js
```

Future use:

Reference only. Do not build from this file.

---

### `googleMapsApiTest/dbTest.js`

Moved to:

```txt
reference/trash-candidates/one-off-db-test/dbTest.parking-lot.js
```

Why parked:

It proves that a MongoDB connection and one query worked once.

Why not active:

It hard-codes the old test database/collection and is a one-off script, not app architecture.

Future use:

Likely none. Use `backend/config/db.js` instead.

---

### `googleMapsApiTest/placeDataLoader.js`

Moved to:

```txt
reference/trash-candidates/broken-loader/placeDataLoader.parking-lot.js
```

Why parked:

It was probably intended to insert Google Places documents into MongoDB.

Why not active:

It is broken/incomplete. The main function expects a document argument but the file calls it without one.

Future use:

Likely none. Replace with a real seed script later if needed.

---

### `googleMapsApiTest/testItems.json`

Moved to:

```txt
reference/trash-candidates/toy-data/testItems.parking-lot.json
```

Why parked:

It demonstrates the rough idea that one searched item can map to multiple locations.

Why not active:

The data uses toy terms like `square`, `triangle`, and `cube`, and does not match the Ingredient Finder domain model.

Future use:

Likely none. Replace with ingredient/vendor/report seed data.

---

### `loginDbConnection/loginDbTest.js`

Moved to:

```txt
reference/trash-candidates/auth-experiment/loginDbTest.parking-lot.js
```

Why parked:

It preserves the auth experiment without letting it steer the app.

Why not active:

Auth is not the current branch priority, and the file has enough design/logic issues that rewriting later is cleaner than patching it.

Future use:

Reference only, if the team wants to understand what had been tried.

---

### `about.html`

Moved to:

```txt
reference/trash-candidates/placeholder-pages/about.parking-lot.html
```

Why parked:

It had team/about-page placeholder value.

Why not active:

It is not part of the current search/report/request MVP.

Future use:

Possibly copy text/team names later if an About page becomes relevant.

---

## New Backend Files

### `backend/app.js`

Created as the Express app configuration file.

Responsibilities:

```txt
- creates the Express app
- enables JSON body parsing
- serves the frontend folder statically
- mounts /api/health
- mounts /api/search
```

Why this exists:

Keeps app configuration separate from server startup.

---

### `backend/server.js`

Created as the process entry point.

Responsibilities:

```txt
- imports app
- loads environment config
- attempts database connection
- starts listening on the configured port
```

Why this exists:

Keeps process startup separate from Express app configuration.

Current split:

```txt
app.js    = Express app setup
server.js = actual startup
```

---

### `backend/config/env.js`

Created as the single place to read environment variables.

Current values:

```txt
PORT
MONGODB_URI
ACTIVE_VENDOR_PROVIDER
```

Why this exists:

Prevents `process.env` access from being scattered across unrelated files.

---

### `backend/config/db.js`

Created as the MongoDB connection helper.

Current behavior:

```txt
- if MONGODB_URI exists, attempt to connect with Mongoose
- if MONGODB_URI is missing, log a warning and continue running
```

Why this exists:

The mock-provider demo should still run even before database persistence is wired up.

---

### `backend/controllers/healthController.js`

Created for the health-check endpoint.

Current response:

```json
{
  "status": "ok",
  "service": "ingredient-finder-api"
}
```

Why this exists:

Provides a quick way to confirm the backend is alive.

---

### `backend/controllers/searchController.js`

Created for request/response handling around vendor search.

Responsibilities:

```txt
- read ingredient/location query params
- call the search service
- send the successful JSON response
- send a consistent error shape on failure
```

Why this exists:

Keeps HTTP request/response handling out of the service layer.

---

### `backend/routes/healthRoutes.js`

Created for:

```txt
GET /api/health
```

Why this exists:

Keeps route definition tiny and separate from controller logic.

---

### `backend/routes/searchRoutes.js`

Created for:

```txt
GET /api/search/vendors
```

Why this exists:

Keeps URL/method definition separate from search behavior.

---

### `backend/services/searchService.js`

Created as the current core workflow file.

Current flow:

```txt
- validate/normalize ingredient input
- call active vendor provider
- build stable response shape
- attach placeholder ingredient status
- return result
```

Why this exists:

This is where the main search workflow belongs. Mongo/report enrichment will eventually be added here, but was intentionally not added during the cleanup pass.

---

### `backend/providers/activeVendorProvider.js`

Created as the provider selector.

Current supported provider:

```txt
mock
```

Why this exists:

The rest of the backend should not import mock, Overpass, or Google providers directly.

Future supported values:

```txt
mock
overpass
google
```

---

### `backend/providers/mockVendorProvider.js`

Created as the demo-safe provider.

Current behavior:

```txt
- returns 10 normalized mock vendors around Vancouver
- accepts ingredient/location input
- does not depend on external APIs
- does not depend on MongoDB
```

Why this exists:

The app should be demoable and frontend-testable before Overpass or Google Places are added.

---

### `backend/utils/normalizeIngredientName.js`

Created to normalize ingredient search text.

Current behavior:

```txt
trim
lowercase
collapse extra spaces
```

Example:

```txt
"  Oaxaca   Cheese " -> "oaxaca cheese"
```

Why this exists:

Ingredient search and deduping need one consistent normalization rule.

---

### `backend/utils/normalizeVendor.js`

Created to enforce the frontend-facing vendor shape.

Current output shape:

```js
{
  id,
  name,
  address,
  lat,
  lng,
  source,
  categories,
  externalIds
}
```

Why this exists:

Providers can change, but the frontend contract should remain stable.

---

### `backend/utils/buildIngredientStatus.js`

Created as a placeholder for the future report-summary layer.

Current output:

```js
{
  status: "UNKNOWN",
  lastConfirmedAt: null,
  foundCount: 0,
  notFoundCount: 0
}
```

Why this exists:

The final response shape should already include `ingredientStatus`, even before real report aggregation exists.

---

## New Frontend Files

### `frontend/index.html`

Created as the new active homepage.

Current elements:

```txt
favicon link
ingredient input
location input
search button
search summary
vendor results container
```

Why this exists:

Provides a real entry point for the active app instead of relying on prototype HTML files.

---

### `frontend/assets/favicon.svg`

Added as the project favicon for the active frontend.

Responsibilities:

```txt
- gives the browser tab a project-specific icon
- makes the local/demo app easier to visually identify
- avoids the default missing-favicon request/noise during browser testing
```

Why this exists:

The app should have a small but complete frontend identity during demos and local development.

If the final favicon file uses a different name or format, keep this changelog entry aligned with the actual committed asset path.

---

### `frontend/css/styles.css`

Created as the first clean CSS file.

Current sections:

```txt
Page Layout
Hero / Search
Vendor Cards
```

Why this exists:

Creates a simple, readable UI with section comments and tweakable-value comments, matching the project style guide.

---

### `frontend/js/app.js`

Created as the frontend entry point.

Current behavior:

```js
initSearchForm();
```

Why this exists:

Keeps the frontend entry file small and prevents the old `app.js` from becoming a giant mixed-responsibility file.

---

### `frontend/js/api/vendorApi.js`

Created as the frontend API helper for vendor search.

Current responsibility:

```txt
- build query params
- call /api/search/vendors
- return parsed JSON
- throw a useful error if the request fails
```

Why this exists:

UI files should not scatter raw fetch calls throughout the frontend.

---

### `frontend/js/ui/searchForm.js`

Created to manage the search form.

Current responsibilities:

```txt
- read form values
- call vendorApi.searchVendors()
- update search summary
- call renderVendorList()
- handle search errors
```

Why this exists:

Keeps form/event behavior separate from API and card rendering logic.

---

### `frontend/js/ui/vendorCards.js`

Created to render vendor cards.

Current responsibilities:

```txt
- receive normalized vendor objects
- render vendor name
- render address
- render categories
- render ingredient status
```

Why this exists:

UI rendering should receive data and create DOM output. It should not fetch data or know provider details.

---

## Package and Config Changes

### `package.json`

Changed to:

```json
{
  "name": "ingredient-finder-capstone",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "node backend/server.js"
  },
  "dependencies": {
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "mongoose": "^9.6.1"
  }
}
```

Important changes:

```txt
- added start script
- added dev script
- removed node as a dependency
- removed mongodb native driver dependency
- kept mongoose
- kept express
- kept dotenv
```

Why this matters:

The app is now positioned around Mongoose for MongoDB once models are added, and Node itself is not incorrectly listed as an app dependency.

---

### `package-lock.json`

Regenerated to match the cleaned `package.json`.

Why this matters:

Keeps dependency installation reproducible.

---

### `.env.example`

Added:

```txt
PORT=3000
MONGODB_URI=
ACTIVE_VENDOR_PROVIDER=mock
```

Why this exists:

Gives teammates a safe local setup template without committing real secrets.

---

### `.gitignore`

Expanded to ignore:

```txt
node_modules/
.env
.env.local
.idea/
.vscode/
.DS_Store
Thumbs.db
*.log
npm-debug.log*
```

Why this matters:

Prevents local dependencies, secrets, editor settings, and logs from being committed.

---

## Project Style / Documentation Standard Changes

### Commenting and teaching standard

The detailed commenting/teaching standard was moved out of the public README and into the project memory document.

Why:

The README should stay focused on outward-facing setup, architecture, and usage information. The deeper commenting standard is still important, but it belongs in the internal working charter used to keep implementation consistent.

Current rule:

```txt
Comments, README sections, setup guides, and demo pages should explain how and why the code works while staying outward-facing for teammates and instructors.
```

### Formatting standard

The project memory now records the expected formatting standard:

```txt
Windows CRLF line separators
JetBrains-style 4-space indentation
```

Why:

This reduces noisy reformatting in the user's Windows/JetBrains workflow.

---

## README Changes

`README.md` was fully rewritten.

It now includes:

```txt
project summary
current branch status
local setup instructions
current file tree
architecture direction
current request flow
preserved prototype explanation
next recommended task
```

Why this matters:

The README now describes the actual cleaned state of the repo instead of acting as a placeholder.

---

## Current Active API Route

```txt
GET /api/search/vendors?ingredient=Oaxaca%20cheese&location=Vancouver
```

Expected response shape:

```js
{
  ingredient: {
    id,
    name,
    normalizedName
  },
  searchLocation: {
    label,
    lat,
    lng
  },
  vendors: [
    {
      id,
      name,
      address,
      lat,
      lng,
      source,
      categories,
      externalIds,
      ingredientStatus: {
        status,
        lastConfirmedAt,
        foundCount,
        notFoundCount
      }
    }
  ]
}
```

---

## Current Manual Test Checklist

After applying the cleanup and deleting old root leftovers, run:

```bash
npm install
npm run dev
```

Then test:

```txt
http://localhost:3000
http://localhost:3000/api/health
http://localhost:3000/api/search/vendors?ingredient=Oaxaca%20cheese&location=Vancouver
```

Expected result:

```txt
- homepage loads
- health endpoint returns status ok
- vendor search returns mock vendors
```

---

## Expected Root Structure After Cleanup

After deleting old original leftovers, the repo should roughly look like:

```txt
.
├── backend/
├── frontend/
│   └── assets/
├── reference/
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── package-lock.json
```

---

## Intentional Non-Changes

The cleanup pass intentionally did not build:

```txt
MongoDB models
Ingredient model
Vendor model
IngredientReport model
IngredientRequest model
Auth routes
Report submission route
Request submission route
Leaflet map UI
Overpass provider
Google Places provider
```

Why:

This pass was for stabilizing the base repo, not completing the MVP.

---

## Recommended Next Branch

Suggested next branch:

```txt
feature/overpass-vendor-provider
```

Goal:

Create:

```txt
backend/providers/overpassVendorProvider.js
```

Requirement:

It should return the same normalized vendor shape as the mock provider, so the frontend does not need to change.

---
