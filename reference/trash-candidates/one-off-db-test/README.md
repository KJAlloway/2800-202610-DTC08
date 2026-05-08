# One-off DB Test

## Why this is parked

This script proves a MongoDB connection and one query against a test collection, but it is not app architecture.

## Why it should not be used

- Hard-codes the `googleApiTest` database and `testItems` collection.
- Logs directly to the console instead of returning data through a service.
- Creates and closes its own Mongo client as a script.
- Uses toy item data that does not match the final ingredient/vendor/report model.

## Replacement path

Use `backend/config/db.js` for database connection and future service/model files for app queries.
