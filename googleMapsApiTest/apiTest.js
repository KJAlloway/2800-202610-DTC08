import express from "express"
import __dirname from "path";
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/apiTest.html')
});

app.use(express.static('googleMapsApiTest'))