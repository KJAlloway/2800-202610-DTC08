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