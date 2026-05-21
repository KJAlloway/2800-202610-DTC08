import { verifyAccessToken } from "../utils/tokens.js";

export function authenticate(request, response, next) {
    const token = request.cookies.accessToken;

    if (!token) {
        return response.status(401).json({ message: "Not authenticated." });
    }

    try {
        const payload = verifyAccessToken(token);
        request.user = payload; // { userId, role }
        next();
    } catch {
        return response.status(401).json({ message: "Invalid or expired access token." });
    }
}