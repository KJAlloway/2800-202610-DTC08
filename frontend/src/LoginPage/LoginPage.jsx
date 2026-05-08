import { useEffect, useState } from 'react'
import Button from '../TemplateButtons/Button'
import cabbageLogo from '../assets/cabbage-logo.svg'
import './LoginPage.css'

function LoginPage({ onLogin, onGuest, onRegister }) {
    // Gets the current year automatically for the footer.
    const currentYear = new Date().getFullYear()

    // This key is used to store the user's popup preference in localStorage.
    const popupPreferenceKey = 'hideLoginTrustPopup'

    // Stores the user's input for both login fields.
    const [loginForm, setLoginForm] = useState({
        identifier: '',
        password: '',
    })

    // Controls whether the popup is currently visible on the page.
    const [showTrustPopup, setShowTrustPopup] = useState(false)

    // Tracks whether the user checked "Don't show this again".
    const [disablePopupPermanently, setDisablePopupPermanently] = useState(false)

    // Runs once when the component first loads.
    // Checks whether the user previously chose to hide this popup.
    useEffect(() => {
        const savedPreference = localStorage.getItem(popupPreferenceKey)

        if (savedPreference !== 'true') {
            setShowTrustPopup(true)
        }
    }, [])

    // Updates the correct field whenever the user types.
    const handleInputChange = (event) => {
        const { name, value } = event.target

        setLoginForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }))
    }

    // Runs when the user checks or unchecks the popup's disable option.
    const handleDisablePopupChange = (event) => {
        setDisablePopupPermanently(event.target.checked)
    }

    // Closes the popup.
    // If the user asked not to see it again, we save that choice in localStorage.
    const handleCloseTrustPopup = () => {
        if (disablePopupPermanently) {
            localStorage.setItem(popupPreferenceKey, 'true')
        }

        setShowTrustPopup(false)
    }

    // Runs when the login form is submitted.
    const handleLoginSubmit = (event) => {
        // Prevents the browser from refreshing the page.
        event.preventDefault()

        // TODO: Replace this later with real login/authentication logic.
        console.log('Login submitted:', loginForm)

        if (onLogin) {
            onLogin()
        }
    }

    // Runs when the user clicks the register button.
    const handleRegisterClick = () => {
        // If a register-page callback exists later, use it.
        if (onRegister) {
            onRegister()
            return
        }

        console.log('Go to register page')
    }

    // Runs when the user wants to continue without signing in.
    const handleGuestClick = () => {
        // Sends the user straight to the home page in guest mode.
        if (onGuest) {
            onGuest()
            return
        }

        console.log('Continue without an account')
    }

    return (
        <main className="login-page-wrapper">
            {/* Small page title above the login card */}
            <p className="login-page-context-title">Login page</p>

            {/* Main login card container */}
            <section className="login-card" aria-labelledby="login-heading">
                {/* Top brand/header section */}
                <header className="login-header">
                    <div className="login-brand-lockup">
                        {/* Logo box */}
                        <div className="login-brand-outer-frame">
                            <div className="login-brand-inner-tray">
                                <img
                                    src={cabbageLogo}
                                    alt="Cabbage Patch logo"
                                    className="login-brand-logo"
                                />
                            </div>
                        </div>

                        {/* App name box */}
                        <div className="login-brand-text-outer">
                            <div className="login-brand-text-tray">
                                <div className="login-brand-name-stacked">
                                    <span>Cabbage</span>
                                    <span>Patch</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Trust popup, explains why logging in matters, but still allows guest use. */}
                {showTrustPopup && (
                    <aside
                        className="login-trust-popup"
                        aria-label="Why logging in matters"
                    >
                        <div className="login-trust-popup__header">
                            <h2 className="login-trust-popup__title">
                                Why log in?
                            </h2>

                            <button
                                type="button"
                                className="login-trust-popup__close"
                                onClick={handleCloseTrustPopup}
                                aria-label="Close popup"
                            >
                                ×
                            </button>
                        </div>

                        <p className="login-trust-popup__text">
                            Information provided when you are logged in is more
                            trustworthy and valuable to other users.
                        </p>

                        <p className="login-trust-popup__text">
                            Logged-in users are marked as verified users, while
                            guest users can still contribute anonymously.
                        </p>

                        <label className="login-trust-popup__checkbox-row">
                            <input
                                type="checkbox"
                                checked={disablePopupPermanently}
                                onChange={handleDisablePopupChange}
                            />
                            <span>Don&apos;t show this again</span>
                        </label>
                    </aside>
                )}

                {/* Middle section with form fields and buttons */}
                <div className="login-body">
                    {/* Hidden heading for accessibility */}
                    <h1 id="login-heading" className="sr-only">
                        Log in to Cabbage Patch
                    </h1>

                    {/* Login form */}
                    <form className="login-form" onSubmit={handleLoginSubmit}>
                        <div className="login-fields">
                            {/* Username or email field */}
                            <label className="sr-only" htmlFor="login-identifier">
                                Username or email
                            </label>

                            <div className="login-field-shell">
                                <div className="login-field-tray">
                                    <input
                                        id="login-identifier"
                                        className="login-input"
                                        type="text"
                                        name="identifier"
                                        placeholder="Username/Email"
                                        autoComplete="username"
                                        value={loginForm.identifier}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <label className="sr-only" htmlFor="login-password">
                                Password
                            </label>

                            <div className="login-field-shell">
                                <div className="login-field-tray">
                                    <input
                                        id="login-password"
                                        className="login-input"
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        autoComplete="current-password"
                                        value={loginForm.password}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Main action buttons */}
                        <div className="login-actions">
                            <Button
                                text="Sign Up/Register"
                                className="login-action-button"
                                onClick={handleRegisterClick}
                            />

                            <Button
                                text="Login"
                                className="login-action-button"
                                type="submit"
                            />
                        </div>
                    </form>

                    {/* Guest access button */}
                    <Button
                        text="Continue without an account"
                        className="login-action-button login-action-button--guest"
                        onClick={handleGuestClick}
                    />
                </div>

                {/* Footer section */}
                <footer className="login-card-footer">
                    <div className="login-footer-line" aria-hidden="true"></div>
                    <p>Copyright DTC-08</p>
                    <p className="login-footer-year">{currentYear}</p>
                </footer>
            </section>
        </main>
    )
}

export default LoginPage
