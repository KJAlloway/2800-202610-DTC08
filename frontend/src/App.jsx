import './App.css'

// Main React component for frontend, decides what appears on the screen by returning the login page.
//
// author: David Lukac
// version 1.0
function App() {
    // use the current year
    const currentYear = new Date().getFullYear()

    const handleLoginSubmit = (event) => {
        event.preventDefault()

        // TODO: replace with real login logic
        console.log('login submitted')
    }

    const handleRegisterClick = () => {
        // TODO: replace with navigation to register screen
        console.log('go to register screen')
    }

    const handleGuestClick = () => {
        // TODO: replace with guest-mode navigation
        console.log('continue without an account')
    }


    // Certain parts of this code were extracted from W3Schools and ChatGPT
    return (
        <main className="login-page">
            {/* small title above the card to match the sketch */}
            <p className="login-page-title">Login Page</p>

            <section className="login-card" aria-labelledby="login-heading">
                <header className="login-card-header">
                    {/* logo placeholder */}
                    <div className="brand-badge" aria-hidden="true">
                        <span className="brand-badge-emoji">🥬</span>
                    </div>

                    <div className="brand-name" aria-label="Cabbage Patch">
                        <span>Cabbage</span>
                        <span>Patch</span>
                    </div>
                </header>

                <div className="login-card__body">
                    <h1 id="login-heading" className="sr-only">Log in to Cabbage Patch</h1>

                    <form className="login-form" onSubmit={handleLoginSubmit}>
                        <label className="sr-only" htmlFor="login-identifier">Username or email</label>
                        <input
                            id="login-identifier"
                            className="login-input"
                            type="text"
                            name="identifier"
                            placeholder="Username/Email"
                            autoComplete="username"
                        />

                        <label className="sr-only" htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            className="login-input"
                            type="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                        />

                        <div className="login-actions">
                            <button
                                type="button"
                                className="action-button"
                                onClick={handleRegisterClick}
                            >
                                Sign Up/Register
                            </button>

                            <button type="submit" className="action-button">
                                Login
                            </button>
                        </div>
                    </form>

                    <button
                        type="button"
                        className="action-button action-button--guest"
                        onClick={handleGuestClick}
                    >
                        Continue without an account
                    </button>
                </div>

                <footer className="login-card__footer">
                    <div className="login-card__footer-line" aria-hidden="true"></div>
                    <p>Copyright DTC-08</p>
                    <p className="login-card__year">{currentYear}</p>
                </footer>
            </section>
        </main>
    )
}

export default App
