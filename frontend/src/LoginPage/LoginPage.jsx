import { useState } from 'react'
import Button from '../TemplateButtons/Button'
import cabbageLogo from '../assets/cabbage-logo.svg'
import './LoginPage.css'

function LoginPage() {
    // Gets the current year automatically for the footer.
    const currentYear = new Date().getFullYear()

    // Stores the user's input for both login fields.
    const [loginForm, setLoginForm] = useState({
        identifier: '',
        password: '',
    })

    // Updates the correct field whenever the user types.
    const handleInputChange = (event) => {
        const { name, value } = event.target

        setLoginForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }))
    }

    // Runs when the login form is submitted.
    const handleLoginSubmit = (event) => {
        // Prevents the page from refreshing when the form is submitted.
        event.preventDefault()

        // TODO: Replace this later with real login/authentication logic.
        console.log('Login submitted:', loginForm)
    }

    // Runs when the user clicks the register button.
    const handleRegisterClick = () => {
        // TODO: Replace this later with navigation to the register page.
        console.log('Go to register page')
    }

    // Runs when the user wants to continue without signing in.
    const handleGuestClick = () => {
        // TODO: Replace this later with guest-mode navigation.
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

                {/* Middle section with form fields and buttons */}
                <div className="login-body">
                    {/* Hidden heading for screen readers and accessibility */}
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
