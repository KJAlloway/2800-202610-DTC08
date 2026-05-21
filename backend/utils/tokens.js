import jwt from "jsonwebtoken";

const ACCESS_TOKEN_LIFETIME = "15m";
const REFRESH_TOKEN_LIFETIME = "7d";

export function createAccessToken(user) {
    const payload = {
        userId: user._id,
        role: user.role
    };

    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_LIFETIME
    });
}

export function createRefreshToken(user) {
    const payload = {
        userId: user._id
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_LIFETIME
    });
}

export function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}