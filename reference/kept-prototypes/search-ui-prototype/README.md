# Search UI Prototype

## Why this is being kept

This was an early proof of concept for search input normalization and simple result rendering. The normalization idea is still relevant because ingredient names and user search terms should be cleaned before matching or deduping.

## Why this is not being used directly

The current app should keep frontend event listeners small and should call backend API helpers instead of storing fake database data inside inline HTML scripts.

The useful idea is `normalize string -> compare against normalized options`; the final implementation belongs in named utility/helper files.
