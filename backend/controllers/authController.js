import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken
} from "../utils/tokens.js";

// Cookie lifetimes, kept here so the access and refresh routes
// stay consistent and the numbers are explained in one place.
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;          // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Shared cookie security settings.
//
// httpOnly  - JavaScript on the page cannot read the cookie (XSS defense).
// sameSite  - the browser only sends the cookie on same-site requests (CSRF defense).
//
// Note: a `secure: true` flag (HTTPS-only) will be added when the app is
// deployed. It is left off here because local development runs on plain http.
const BASE_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "strict"
};

// POST /api/auth/register
//
// Creates a new account. Validates input, rejects duplicate emails,
// hashes the password, and stores the user.
export async function register(request, response) {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                message: "Email and password are required."
            });
        }

        if (password.length < 8) {
            return response.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ normalizedEmail });

        if (existingUser) {
            return response.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await hashPassword(password);

        const newUser = await User.create({
            email: email.trim(),
            normalizedEmail,
            passwordHash
        });

        response.status(201).json({
            message: "Account created.",
            user: {
                id: newUser._id,
                email: newUser.email,
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

// POST /api/auth/login
//
// Verifies credentials, issues an access token and a refresh token,
// stores the refresh token in the database, and sends both as cookies.
export async function login(request, response) {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ normalizedEmail });

        // A missing user and a wrong password return the SAME response.
        //
        // Different messages would let an attacker discover which emails
        // have accounts, so both failures are deliberately identical.
        if (!user) {
            return response.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordIsCorrect = await verifyPassword(password, user.passwordHash);

        if (!passwordIsCorrect) {
            return response.status(401).json({
                message: "Invalid email or password."
            });
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        // The refresh token is stored so it can be checked (and revoked)
        // later. The access token is intentionally never stored.
        const expiresAt = new Date(Date.now() + REFRESH_COOKIE_MAX_AGE);

        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt
        });

        response.cookie("accessToken", accessToken, {
            ...BASE_COOKIE_OPTIONS,
            maxAge: ACCESS_COOKIE_MAX_AGE
        });

        response.cookie("refreshToken", refreshToken, {
            ...BASE_COOKIE_OPTIONS,
            maxAge: REFRESH_COOKIE_MAX_AGE
        });

        response.json({
            message: "Logged in.",
            user: {
                id: user._id,
                email: user.email,
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

// POST /api/auth/refresh
//
// Issues a fresh access token when the old one has expired. Requires a
// refresh token that is both cryptographically valid AND still present
// in the database.
export async function refresh(request, response) {
    try {
        const tokenFromCookie = request.cookies.refreshToken;

        if (!tokenFromCookie) {
            return response.status(401).json({
                message: "No refresh token provided."
            });
        }

        // jwt.verify throws on a bad or expired token, so this call gets
        // its own try/catch. An expired token is a normal 401, not a 500.
        let payload;
        try {
            payload = verifyRefreshToken(tokenFromCookie);
        } catch (verifyError) {
            return response.status(401).json({
                message: "Invalid or expired refresh token."
            });
        }

        // The database check is the revocation mechanism. A token can be
        // cryptographically valid but absent here (e.g. after logout),
        // in which case refresh is denied.
        const storedToken = await RefreshToken.findOne({ token: tokenFromCookie });

        if (!storedToken) {
            return response.status(401).json({
                message: "Refresh token is no longer valid."
            });
        }

        // Look the user up fresh so the new access token reflects their
        // current role, and so deleted users cannot refresh.
        const user = await User.findById(payload.userId);

        if (!user) {
            return response.status(401).json({
                message: "User no longer exists."
            });
        }

        const newAccessToken = createAccessToken(user);

        response.cookie("accessToken", newAccessToken, {
            ...BASE_COOKIE_OPTIONS,
            maxAge: ACCESS_COOKIE_MAX_AGE
        });

        response.json({ message: "Token refreshed." });
    } catch (error) {
        console.error("Refresh error:", error);
        response.status(500).json({
            message: "Something went wrong refreshing the token."
        });
    }
}
