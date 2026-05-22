import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loginUser, registerUser, logoutUser, refreshToken, getMe } from "../APIs/Database.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [authOverlayIsOpen, setAuthOverlayIsOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastFading, setToastFading] = useState(false);
    // True while the initial session-restore check is in flight. Prevents the
    // UI from flashing "not logged in" before we've had a chance to check.
    const [isRestoringSession, setIsRestoringSession] = useState(true);
    const toastTimerRef = useRef(null);

    // On mount: try to restore the session from the cookies the browser already
    // holds. If the access token is still valid, /me returns the user immediately.
    // If it's expired (401), attempt a silent refresh then retry /me. If both
    // fail the user is simply not logged in and we proceed normally.
    useEffect(() => {
        async function restoreSession() {
            try {
                const user = await getMe();
                setCurrentUser(user);
            } catch (error) {
                if (error.status === 401) {
                    // Access token expired — try refreshing silently.
                    try {
                        await refreshToken();
                        const user = await getMe();
                        setCurrentUser(user);
                    } catch {
                        // Refresh token also gone or invalid — stay logged out.
                    }
                }
                // Any other error (network down, 500, etc.) — stay logged out.
            } finally {
                setIsRestoringSession(false);
            }
        }

        restoreSession();
    }, []);

    function showToast(message, delay = 0) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
            setToastFading(false);
            setToastMessage(message);
            toastTimerRef.current = setTimeout(() => {
                setToastFading(true);
            }, 500);
        }, delay);
    }

    async function login(email, password) {
        const user = await loginUser(email, password);
        setCurrentUser(user);
        setAuthOverlayIsOpen(false);
        showToast("Logged in.", 50);
    }

    async function register(name, email, password) {
        const user = await registerUser(name, email, password);
        setCurrentUser(user);
        setAuthOverlayIsOpen(false);
        showToast("Logged in.", 50);
    }

    async function logout() {
        await logoutUser();
        setCurrentUser(null);
        showToast("Logged out.");
    }

    return (
        <AuthContext.Provider value={{
            currentUser,
            authOverlayIsOpen,
            setAuthOverlayIsOpen,
            login,
            register,
            logout,
            toastMessage,
            toastFading,
            setToastMessage,
            isRestoringSession,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
