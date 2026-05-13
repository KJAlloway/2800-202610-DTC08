const express  = require("express");
const session = require("express-session");
const app = express();

app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}))



const authRoutes = require("./routes/authRoutes")

app.use("/auth", authRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

app.get("/", (req, res) => {
    res.send("Hello World!");
})