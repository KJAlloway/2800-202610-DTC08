import { createContext, useContext, useRef, useState } from "react";
import { loginUser, registerUser, logoutUser } from "../APIs/Database.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [authOverlayIsOpen, setAuthOverlayIsOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastFading, setToastFading] = useState(false);
    const toastTimerRef = useRef(null);

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
            setToastMessage
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
