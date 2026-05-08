/**
 * PROTOTYPE ARCHIVE — not imported by the app.
 *
 * Why this is kept:
 * - Confirms the team had a basic Express server serving the API test page.
 *
 * Why this is not used directly:
 * - Mixes one-off test serving with backend entry-point behavior.
 * - Serves files from the prototype folder instead of the app's `frontend/` directory.
 * - Does not expose the planned `/api/search/vendors` contract.
 */

// Source - https://stackoverflow.com/a/50052194
// Posted by GOTO 0, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-05, License - CC BY-SA 4.0

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// end of copied code


import express from "express"
const app = express();
const PORT = 3000;

// app.use(express.static(__dirname + "public"));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/apiTest.html')
});

app.get("/dbTest.js", (req, res) => {
    res.sendFile(__dirname + '/dbTest.js')
})