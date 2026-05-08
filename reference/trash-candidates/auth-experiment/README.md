# Auth Experiment

## Why this is parked

This file shows an early attempt at account lookup and account creation.

## Why it should not be used

- Auth is not the current branch priority.
- Uses plaintext password comparison.
- Uses `collection.find(...)` in truthiness checks, which checks for a cursor object rather than proving a user exists.
- Imports `mongoose` but uses the native Mongo client.
- Wraps async logic in unnecessary manual Promises.
- Has a control-flow bug where `console.log("email already in use")` appears after the early return path.

## Replacement path

Build auth later through proper `authRoutes`, `authController`, `authService`, and `User` model files only after the search/report/request MVP is stable.
