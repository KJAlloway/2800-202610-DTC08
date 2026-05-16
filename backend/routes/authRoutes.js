const express = require("express");
const authRouter = express.Router();

const {
    loginUser,
    registerUser,
    logoutUser,
    getUserInfo
} = require("../controllers/authController")

const { isAuthenticated } = require("../middleware/authMiddleware")

// POST login form
authRouter.post("/login", loginUser);

// POST register form
authRouter.post("/register", registerUser);

// logout
authRouter.get("/logout", logoutUser);

authRouter.get("/userInfo", isAuthenticated, getUserInfo);

authRouter.get("/testAuth", isAuthenticated, (req, res) => {
    console.log("User is logged in");
    res.send("Welcome to dashboard");
});

export default authRouter