const express = require("express");
const app = express();
const PORT = 3000;

// app.use(express.static(__dirname + "public"));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/apiTest.html')
});

app.get("/")
