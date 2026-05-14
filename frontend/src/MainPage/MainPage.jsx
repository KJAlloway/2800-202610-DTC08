import React, { useEffect, useState } from 'react'
import { useFirstTimeHint } from '../hooks/useFirstTimeHint';
import './MainPage.css'
import Button from '../TemplateButtons/Button'
import SearchBar from '../SearchBar/SearchBar'
import FirstTimeHint from '../FirstTimeHint/FirstTimeHint'
import { NavBar, Footer } from '../NavbarAndFooter/sharedComponents'
import cabbageLogo from '../assets/cabbage-logo.svg'

function SearchSection({ isLoading, error, value, onChange, suggestions, onSelect }) {
    return (
        <section className="search-section">
            <SearchBar
                text={isLoading ? 'Loading suggestions...' : error || 'Search for any food'}
                value={value}
                onChange={onChange}
                suggestions={suggestions}
                onSuggestionSelect={onSelect}
            />
        </section>
    )
}

function ActionSection({ onOpenRequest, onOpenRequestedFoods }) {
    return (
        <section className="action-section">
            <Button
                text="Submit a request for unavailable food"
                className="full-width-action"
                onClick={onOpenRequest}
            />
            <Button
                text="View local commonly requested foods"
                className="full-width-action"
                onClick={onOpenRequestedFoods}
            />
        </section>
    )
}

function MainPage({
    onLogout,
    onOpenRequestPage,
    onOpenRequestedFoodsPage
}) {
    // Gets the current year automatically for the footer.
    const currentYear = new Date().getFullYear()
    const [showHints, onDisableHints] = useFirstTimeHint('cabbagepatch_main_hint_hidden');

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
                <NavBar onLogout={onLogout} />

                {showHints && (
                    <FirstTimeHint
                        title="Welcome to Cabbage Patch!"
                        message="Search for specific items available in your area or request new ones below."
                        onDismiss={onDisableHints}
                    />
                )}

                <SearchSection
                    isLoading={isLoadingSuggestions}
                    error={suggestionError}
                    value={searchValue}
                    onChange={handleSearchChange}
                    suggestions={aiSuggestions}
                    onSelect={handleSuggestionSelect}
                />

                <ActionSection
                    onOpenRequest={onOpenRequestPage}
                    onOpenRequestedFoods={onOpenRequestedFoodsPage}
                />
                <Footer />
            </section>
        </main>
    )
}

export default MainPage
