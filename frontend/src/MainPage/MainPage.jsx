import React, { useEffect, useState } from 'react'
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
    const [aiSuggestions, setAiSuggestions] = useState([])
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
    const [suggestionError, setSuggestionError] = useState('')

    const handleSearchChange = (event) => {
        setSearchValue(event.target.value)
    }

    const handleSuggestionSelect = (suggestion) => {
        setSearchValue(suggestion.name)
    }

    // Watches the search input and asks the backend for AI food suggestions.
    // The request is delayed slightly so the app does not call the API after every single keypress.
    useEffect(() => {
        const cleanedSearchValue = searchValue.trim()

        // If the search box is empty, clear the suggestion state and stop here.
        if (!cleanedSearchValue) {
            setAiSuggestions([])
            setSuggestionError('')
            setIsLoadingSuggestions(false)
            return
        }

        // Wait 300ms before calling the backend so fast typing does not create too many requests.
        const requestDelay = setTimeout(async () => {
            setIsLoadingSuggestions(true)
            setSuggestionError('')

            try {
                // Send the current search text to the backend AI suggestion route.
                const response = await fetch('http://localhost:3000/api/ai-suggestions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        searchText: cleanedSearchValue,
                    }),
                })

                // If the backend returns an error status, move into the catch block.
                if (!response.ok) {
                    throw new Error('Suggestion request failed.')
                }

                const data = await response.json()

                // Guardrail: only update the UI if suggestions came back as an array.
                // This prevents unexpected backend responses from breaking the page.
                setAiSuggestions(Array.isArray(data.suggestions) ? data.suggestions : [])
            } catch (error) {
                // If the backend is down or the request fails, keep the app usable.
                console.error('AI suggestion error:', error)
                setAiSuggestions([])
                setSuggestionError('Suggestions are unavailable right now.')
            } finally {
                // Loading ends whether the request succeeds or fails.
                setIsLoadingSuggestions(false)
            }
        }, 300)

        // Cleanup: if the user types again before 300ms passes, cancel the old request.
        return () => clearTimeout(requestDelay)
    }, [searchValue])



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
                        text={
                            isLoadingSuggestions
                                ? 'Loading suggestions...'
                                : suggestionError || 'Search for any food'
                        }
                        value={searchValue}
                        onChange={handleSearchChange}
                        suggestions={aiSuggestions}
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
