# Broken Place Data Loader

## Why this is parked

This was likely intended to insert Google Places documents into MongoDB.

## Why it should not be used

- `run(newDocument)` expects an argument, but the file calls `run()` with no document.
- It is hard-coded to the old `googleApiTest` database.
- It imports raw provider data without normalization.
- It does not belong in the final provider/service architecture.

## Replacement path

When seed data is needed, create an intentional seed script under `backend/seed/` that loads normalized mock vendors or report fixtures.
