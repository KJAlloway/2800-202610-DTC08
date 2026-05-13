const express = require("express");
const router = express.Router();

const {
    loginUser,
    registerUser,
    logoutUser
} = require("../controllers/authController")

const { isAuthenticated } = require("..middleware/authMiddleware")

// POST login form
router.post("/login", loginUser);

// POST register form
router.post("/register", registerUser);

// logout
router.get("/logout", logoutUser);

router.get("/testAuth", isAuthenticated, (req, res) => {
    res.send("Welcome to dashboard");
});

module.exports = router;