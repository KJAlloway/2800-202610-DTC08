import {useState} from "react";
import {useAuth} from "./Auth.jsx";
import "./Auth.css";

export function AuthOverlay() {
    const {
        authOverlayIsOpen,
        setAuthOverlayIsOpen,
        login,
        register,
        toastMessage,
        toastFading,
        setToastMessage
    } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function handleClose() {
        setAuthOverlayIsOpen(false);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setIsRegisterMode(false);
        setErrorMessage("");
    }

    function handleOverlayClick() {
        handleClose();
    }

    function handlePanelClick(event) {
        event.stopPropagation();
    }

    function handleBackClick() {
        setIsRegisterMode(false);
        setErrorMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setIsLoading(true);

        try {
            if (isRegisterMode) {
                if (password !== confirmPassword) {
                    setErrorMessage("Passwords do not match.");
                    setIsLoading(false);
                    return;
                }
                try {
                    await register(name, email, password);
                } catch (registerError) {
                    if (registerError.status === 409) {
                        await login(email, password);
                    } else {
                        throw registerError;
                    }
                }
            } else {
                await login(email, password);
            }
        } catch (error) {
            if (error.status === 404) {
                setIsRegisterMode(true);
                setErrorMessage("No account found with that email — fill in your details below to sign up.");
            } else if (error.status === 401) {
                setErrorMessage("Incorrect password.");
            } else if (error.status === 400 || error.status === 409) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {authOverlayIsOpen && (
                <div className="auth-overlay" onClick={handleOverlayClick}>
                    <div className="auth-overlay__panel" onClick={handlePanelClick}>
                        <header className="auth-overlay__header">
                            <div className="auth-overlay__header-left">
                                {isRegisterMode && (
                                    <button
                                        className="auth-overlay__back-button"
                                        type="button"
                                        aria-label="Back to log in"
                                        onClick={handleBackClick}
                                    >
                                        ‹ Back
                                    </button>
                                )}
                                <h2>{isRegisterMode ? "Create an account" : "Welcome back"}</h2>
                            </div>
                            <button
                                className="auth-overlay__close-button"
                                type="button"
                                aria-label="Close"
                                onClick={handleClose}
                            >
                                ×
                            </button>
                        </header>

                        <form className="auth-overlay__form" onSubmit={handleSubmit}>
                            {errorMessage && (
                                <p className="auth-overlay__error">{errorMessage}</p>
                            )}

                            <label>
                                Email
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </label>

                            <label>
                                Password
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete={isRegisterMode ? "new-password" : "current-password"}
                                />
                            </label>

                            {isRegisterMode && (
                                <>
                                    <label>
                                        Confirm password
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            autoComplete="new-password"
                                        />
                                    </label>

                                    <label>
                                        Name
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            autoComplete="name"
                                        />
                                    </label>
                                </>
                            )}

                            <button
                                className="auth-overlay__submit-button"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "..." : isRegisterMode ? "Sign up" : "Log in"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {toastMessage && (
                <p
                    className={`auth-toast${toastFading ? " auth-toast--fading" : ""}`}
                    onTransitionEnd={() => setToastMessage("")}
                >
                    {toastMessage}
                </p>
            )}
        </>);
}