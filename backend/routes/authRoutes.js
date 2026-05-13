const express = require("express");
const router = express.Router();

const {
    loginUser,
    registerUser,
    logoutUser,
    getUserInfo
} = require("../controllers/authController")

const { isAuthenticated } = require("..middleware/authMiddleware")

// POST login form
router.post("/login", loginUser);

// POST register form
router.post("/register", registerUser);

// logout
router.get("/logout", logoutUser);

router.get("/userInfo", isAuthenticated, getUserInfo);

router.get("/testAuth", isAuthenticated, (req, res) => {
    console.log("User is logged in");
    res.send("Welcome to dashboard");
});

module.exports = router;