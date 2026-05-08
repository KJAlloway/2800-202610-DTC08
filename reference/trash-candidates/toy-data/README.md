# Toy Item Data

## Why this is parked

This file demonstrates the idea that one searched item can map to several current or past locations.

## Why it should not be used

- Uses placeholder item names like `square`, `triangle`, and `cube`.
- Uses `currentLocations` and `pastLocations`, while the project model should use ingredient reports with `FOUND` and `NOT_FOUND` statuses.
- Does not represent users, ingredients, vendors, reports, or requests in the final shape.

## Replacement path

Use `IngredientReport` documents later to represent the real history layer.
