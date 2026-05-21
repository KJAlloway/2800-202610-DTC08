const BASE_URL = "/db";

export async function loginUser(email, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw { status: response.status, message: data.message };
    }

    return data.user;
}

export async function registerUser(name, email, password) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw { status: response.status, message: data.message };
    }

    return data.user;
}

export async function logoutUser() {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        const data = await response.json();
        throw { status: response.status, message: data.message };
    }
}

export async function refreshToken() {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw { status: response.status, message: "Session expired." };
    }
}