# Google Places Raw Sample

## Why this is being kept

This folder preserves the 10-vendor Google Places sample collected by the team. It is useful because it shows the kind of raw vendor/location fields an external provider may return: place IDs, names, addresses, coordinates, categories, ratings, links, opening hours, and other metadata.

This can help later when writing a `googlePlacesVendorProvider` or a provider-normalization utility.

## Why this is not being used directly

The current project direction is to avoid depending on Google Places for the MVP. Google Places requires API-key setup, billing awareness, and extra deployment/security friction.

For the demo-first branch, the app should use normalized mock data first, then add OpenStreetMap/Overpass as the next live provider. This raw Google data should remain a reference fixture, not the app's main data model.

## Preserved files

- `googlePlacesRawSample.json` — original raw sample data.
- `googlePlacesIdNotes.txt` — original human-readable mapping of store names to Google Place IDs.
- `locationDataParser.prototype.js` — original parser experiment, preserved with comments.
