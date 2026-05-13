import React, { useState } from 'react'
import './MainPage.css'
import Button from '../TemplateButtons/Button'
import SearchBar from '../SearchBar/SearchBar'
import cabbageLogo from '../assets/cabbage-logo.svg'
import sampleFoods from '../data/sampleFoods'

// Measures how many single-character changes are needed to turn one word into another.
// As per instructions, this function was assisted with by AI.
function getEditDistance(firstText, secondText) {
    const first = firstText.toLowerCase()
    const second = secondText.toLowerCase()

    const distances = Array.from({ length: first.length + 1 }, () =>
        Array(second.length + 1).fill(0)
    )

    for (let row = 0; row <= first.length; row += 1) {
        distances[row][0] = row
    }

    for (let column = 0; column <= second.length; column += 1) {
        distances[0][column] = column
    }

    for (let row = 1; row <= first.length; row += 1) {
        for (let column = 1; column <= second.length; column += 1) {
            const lettersMatch = first[row - 1] === second[column - 1]
            const substitutionCost = lettersMatch ? 0 : 1

            distances[row][column] = Math.min(
                distances[row - 1][column] + 1,
                distances[row][column - 1] + 1,
                distances[row - 1][column - 1] + substitutionCost
            )
        }
    }

    return distances[first.length][second.length]
}

// Allows close matches so small typos can still return useful food suggestions.
// As per instructions, this function was assisted with by AI.
function isFuzzyMatch(searchText, candidateText) {
    const normalizedSearch = searchText.trim().toLowerCase()
    const normalizedCandidate = candidateText.trim().toLowerCase()

    if (!normalizedSearch || !normalizedCandidate) {
        return false
    }

    const searchWords = normalizedSearch.split(/\s+/)
    const candidateWords = normalizedCandidate.split(/\s+/)

    return searchWords.some((searchWord) =>
        candidateWords.some((candidateWord) => {
            const distance = getEditDistance(searchWord, candidateWord)

            if (searchWord.length <= 4) {
                return distance <= 1
            }

            return distance <= 2
        })
    )
}

// Returns true when searchable food text includes the user's input or closely matches it.
// As per instructions, this function was assisted with by AI.
function foodMatchesSearch(food, searchText) {
    const normalizedSearch = searchText.trim().toLowerCase()

    if (!normalizedSearch) {
        return false
    }

    const searchableValues = [
        food.name,
        food.category,
        ...food.cuisines,
        ...food.alternateNames,
        ...food.searchTerms,
    ]

    return searchableValues.some((value) => {
        const normalizedValue = value.toLowerCase()

        return (
            normalizedValue.includes(normalizedSearch) ||
            isFuzzyMatch(normalizedSearch, normalizedValue)
        )
    })
}

// Converts matching foods into the suggestion format used by SearchBar.
function getFoodSuggestions(searchText) {
    return sampleFoods
        .filter((food) => foodMatchesSearch(food, searchText))
        .slice(0, 5)
        .map((food) => ({
            id: food.id,
            name: food.name,
            detail: food.alternateNames.slice(0, 2).join(', '),
        }))
}


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

    const handleSearchChange = (event) => {
        setSearchValue(event.target.value)
    }

    const handleSuggestionSelect = (suggestion) => {
        setSearchValue(suggestion.name)
    }

    const foodSuggestions = getFoodSuggestions(searchValue)

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
                        suggestions={foodSuggestions}
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
