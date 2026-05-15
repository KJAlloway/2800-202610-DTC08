const express  = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.use(express.json());
app.use(cors({origin: 'http://localhost:5173'})); // React frontend URL


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})


// Sample route to check if the backend is working
app.get("/", (req, resp) => {
    resp.send("App is working");
});

// API to register a user
app.post("/register", async (req, resp) => {
    try {
        const user = new User(req.body);
        let result = await user.save();
        if (result) {
            delete result.password; // Ensure you're not sending sensitive info
            resp.status(201).send(result); // Send successful response
        } else {
            console.log("User already registered");
            resp.status(400).send("User already registered");
        }
    } catch (e) {
        resp.status(500).send({ message: "Something went wrong", error: e.message });
    }
});