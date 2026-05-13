/* The original creator of this file was Donovan. He did amazing work */
/* I need to change a few things here to make the AI work. */
/* As per instructions, parts of this file were changed by AI */

import React from 'react'
import './SearchBar.css'
import searchIcon from '../assets/search-icon.svg'

const SearchBar = ({
                       text,
                       value,
                       onChange,
                       suggestions = [],
                       onSuggestionSelect,
                   }) => {
    // Checks whether there are suggestions to show below the search input.
    const hasSuggestions = suggestions.length > 0

    return (
        <div className="search-wrapper">
            <div className="search-outer-frame">
                <div className="search-inner-tray">
                    <img
                        src={searchIcon}
                        alt=""
                        className="search-svg-icon"
                        aria-hidden="true"
                    />

                    <input
                        type="text"
                        className="search-input"
                        placeholder={text || 'Search...'}
                        value={value}
                        onChange={onChange}
                    />
                </div>
            </div>

            {/* Shows AI suggestions only when the backend returns at least one result. */}
            {hasSuggestions && (
                <div className="ai-suggestion-panel" aria-label="AI suggestions">
                    <p className="ai-suggestion-label">AI suggestions</p>

                    <div className="ai-suggestion-list">
                        {suggestions.map((suggestion) => {
                            // The backend may include alternate names and search terms as relatedNames.
                            // We only show the first few so the suggestion card stays readable.
                            const relatedNames = Array.isArray(suggestion.relatedNames)
                                ? suggestion.relatedNames.slice(0, 3)
                                : []

                            return (
                                <button
                                    key={suggestion.id}
                                    type="button"
                                    className="ai-suggestion-button"
                                    onClick={() => onSuggestionSelect?.(suggestion)}
                                >
                                    <span className="ai-suggestion-name">
                                        {suggestion.name}
                                    </span>

                                    <span className="ai-suggestion-detail">
                                        {suggestion.detail}
                                    </span>

                                    {relatedNames.length > 0 && (
                                        <span className="ai-related-names">
                                            Related: {relatedNames.join(', ')}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchBar

