import React, { useState } from 'react'
import './MainPage.css'
import Button from '../TemplateButtons/Button'
import SearchBar from '../SearchBar/SearchBar'
import cabbageLogo from '../assets/cabbage-logo.svg'

function MainPage({
                      onLogout,
                      onOpenRequestPage,
                      onOpenRequestedFoodsPage,
                  }) {
    // Gets the current year automatically for the footer.
    const currentYear = new Date().getFullYear()

    // Runs when the user clicks the logout button.
    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout()
            return
        }

        console.log('Logout clicked')
    }

    // Opens the page where the user can request a food item.
    const handleOpenRequestPage = () => {
        if (onOpenRequestPage) {
            onOpenRequestPage()
            return
        }

        console.log('Open request food page')
    }

    // Placeholder for the "commonly requested foods" page.
    const handleOpenRequestedFoodsPage = () => {
        if (onOpenRequestedFoodsPage) {
            onOpenRequestedFoodsPage()
            return
        }

        console.log('Open requested foods list page')
    }

    const [searchValue, setSearchValue] = useState('')

    const sampleAiSuggestions = [
        {
            id: 'kimchi',
            name: 'Kimchi',
            detail: 'Also known as kimchee or napa cabbage kimchi',
        },
        {
            id: 'gochujang',
            name: 'Gochujang',
            detail: 'Korean chili paste',
        },
        {
            id: 'banh-pho',
            name: 'Banh pho noodles',
            detail: 'Flat rice noodles often used for pho',
        },
    ]

    const handleSearchChange = (event) => {
        setSearchValue(event.target.value)
    }

    const handleSuggestionSelect = (suggestion) => {
        setSearchValue(suggestion.name)
    }


    return (
        <main className="main-page-wrapper">
            <p className="page-context-title">Main Page</p>

            <section className="main-card">
                <header className="main-header">
                    <div className="header-left">
                        {/* Logo frame */}
                        <div className="brand-outer-frame">
                            <div className="brand-inner-tray">
                                <img
                                    src={cabbageLogo}
                                    alt="Logo"
                                    className="brand-logo"
                                />
                            </div>
                        </div>

                        {/* App name frame */}
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

                {/* Search area */}
                <section className="search-section">
                    <SearchBar
                        text="Search for any food"
                        value={searchValue}
                        onChange={handleSearchChange}
                        suggestions={searchValue ? sampleAiSuggestions : []}
                        onSuggestionSelect={handleSuggestionSelect}
                    />
                </section>

                {/* Main action buttons */}
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

                {/* Footer */}
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
