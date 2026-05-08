import React, { useState } from 'react'
import './MainPage.css'
import Button from '../TemplateButtons/Button'
import SearchBar from '../SearchBar/SearchBar'
import FirstTimeHint from '../FirstTimeHint/FirstTimeHint'
import BackButton from '../BackButtonTemplate/BackButton'
import PageLabel from '../PageLabel/PageLabel'
import cabbageLogo from '../assets/cabbage-logo.svg'

function MainPage({
                      onLogout,
                      onBack,
                      onOpenRequestPage,
                      onOpenRequestedFoodsPage,
                      onOpenFoodLocationPage,
                      showHints,
                      onDisableHints,
                  }) {
    const currentYear = new Date().getFullYear()

    // Stores whatever the user types into the search bar.
    const [searchText, setSearchText] = useState('')

    // Updates the search text whenever the user types.
    const handleSearchChange = (event) => {
        setSearchText(event.target.value)
    }

    // Runs when the user submits the search bar.
    const handleSearchSubmit = () => {
        const cleanedSearchText = searchText.trim()

        // Stops empty searches from being submitted.
        if (!cleanedSearchText) {
            console.log('Please enter a food to search for.')
            return
        }

        // For now, log the search so you can confirm it is working.
        console.log('Search submitted:', cleanedSearchText)

        // Sends the search text upward so App can decide what page to open next.
        if (onOpenFoodLocationPage) {
            onOpenFoodLocationPage(cleanedSearchText)
            return
        }

        console.log('No food-location callback was provided.')
    }

    // Runs when the logout button is clicked.
    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout()
            return
        }

        console.log('Logout clicked')
    }

    // Opens the request-a-food page.
    const handleOpenRequestPage = () => {
        if (onOpenRequestPage) {
            onOpenRequestPage()
            return
        }

        console.log('Open request food page')
    }

    // Opens the commonly requested foods page, if that callback exists.
    const handleOpenRequestedFoodsPage = () => {
        if (onOpenRequestedFoodsPage) {
            onOpenRequestedFoodsPage()
            return
        }

        console.log('Open requested foods list page')
    }

    return (
        <main className="main-page-wrapper">
            <PageLabel text="Main Page" />

            <section className="main-card">
                <header className="main-header">
                    <div className="header-left">
                        <div className="logo-nav-stack">
                            <div className="brand-outer-frame">
                                <div className="brand-inner-tray">
                                    <img
                                        src={cabbageLogo}
                                        alt="Logo"
                                        className="brand-logo"
                                    />
                                </div>
                            </div>

                            <BackButton onClick={onBack} />
                        </div>

                        <div className="brand-text-outer">
                            <div className="brand-text-tray">
                                <div className="brand-name-stacked">
                                    <span>Cabbage</span>
                                    <span>Patch</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="header-right">
                        <Button
                            text="Log out"
                            className="logout-btn"
                            onClick={handleLogoutClick}
                        />
                    </div>
                </header>

                {showHints && (
                    <FirstTimeHint
                        title="Welcome to the main menu!"
                        message="Search for any food item or click below to submit a new request."
                        onDismiss={onDisableHints}
                    />
                )}

                <section className="search-section">
                    <SearchBar
                        placeholder="Search for any food..."
                        value={searchText}
                        onChange={handleSearchChange}
                        onSubmit={handleSearchSubmit}
                        buttonText="Submit search"
                        inputId="main-food-search"
                    />
                </section>

                <section className="action-section">
                    <Button
                        text="Submit a request for unavailable food"
                        className="full-width-action"
                        onClick={handleOpenRequestPage}
                    />

                    <Button
                        text="View local commonly requested foods"
                        className="full-width-action"
                        onClick={handleOpenRequestedFoodsPage}
                    />
                </section>

                <footer className="main-card-footer">
                    <div className="footer-line"></div>
                    <p>Copyright DTC-08</p>
                    <p className="footer-year">{currentYear}</p>
                </footer>
            </section>
        </main>
    )
}

export default MainPage
