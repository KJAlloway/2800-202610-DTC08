import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import {hashPassword, verifyPassword} from "../utils/password.js";
import {
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken
} from "../utils/tokens.js";

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE_MS
};

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_MAX_AGE_MS
};

export async function register(request, response) {
    try {
        const {email, password, name} = request.body;

        if (!email || !password || !name) {
            return response.status(400).json({
                message: "Email, name, and password are required."
            });
        }

        if (password.length < 8) {
            return response.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({normalizedEmail});

        if (existingUser) {
            return response.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await hashPassword(password);

        const newUser = await User.create({
            name: name.trim(),
            email: email.trim(),
            normalizedEmail,
            passwordHash
        });

        response.status(201).json({
            message: "Account created.",
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        response.status(500).json({
            message: "Something went wrong creating the account."
        });
    }
}

export async function login(request, response) {
    try {
        const {email, password} = request.body;

        if (!email || !password) {
            return response.status(400).json({
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({normalizedEmail});

        if (!user) {
            return response.status(404).json({
                message: "No account found with that email."
            });
        }

        const passwordIsCorrect = await verifyPassword(password, user.passwordHash);

        if (!passwordIsCorrect) {
            return response.status(401).json({
                message: "Incorrect password."
            });
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: refreshExpiresAt
        });

        response.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
        response.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

        response.json({
            message: "Logged in.",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        response.status(500).json({
            message: "Something went wrong logging in."
        });
    }
}

export async function logout(request, response) {
    try {
        const tokenFromCookie = request.cookies.refreshToken;

        if (tokenFromCookie) {
            await RefreshToken.deleteOne({token: tokenFromCookie});
        }

        response.clearCookie("accessToken");
        response.clearCookie("refreshToken");

        response.json({message: "Logged out."});
    } catch (error) {
        console.error("Logout error:", error);
        response.status(500).json({message: "Something went wrong logging out."});
    }
}

export async function me(request, response) {
    try {
        const user = await User.findById(request.user.userId).select("-passwordHash -normalizedEmail");

        if (!user) {
            return response.status(404).json({message: "User not found."});
        }

        response.json({user});
    } catch (error) {
        console.error("Me error:", error);
        response.status(500).json({message: "Something went wrong."});
    }
}

export async function refresh(request, response) {
    try {
        const tokenFromCookie = request.cookies.refreshToken;

        if (!tokenFromCookie) {
            return response.status(401).json({
                message: "No refresh token provided."
            });
        }

        let payload;
        try {
            payload = verifyRefreshToken(tokenFromCookie);
        } catch (verifyError) {
            return response.status(401).json({
                message: "Invalid or expired refresh token."
            });
        }

        const storedToken = await RefreshToken.findOne({token: tokenFromCookie});

        if (!storedToken) {
            return response.status(401).json({
                message: "Refresh token is no longer valid."
            });
        }

        const user = await User.findById(payload.userId);

        if (!user) {
            return response.status(401).json({
                message: "User no longer exists."
            });
        }

        await RefreshToken.deleteOne({token: tokenFromCookie});

        const newAccessToken = createAccessToken(user);
        const newRefreshToken = createRefreshToken(user);

        const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
        await RefreshToken.create({
            userId: user._id,
            token: newRefreshToken,
            expiresAt: refreshExpiresAt
        });

        response.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS);
        response.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

        response.json({message: "Token refreshed."});
    } catch (error) {
        console.error("Refresh error:", error);
        response.status(500).json({
            message: "Something went wrong refreshing the token."
        });
    }
}