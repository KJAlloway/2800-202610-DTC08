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

            {hasSuggestions && (
                <div className="ai-suggestion-panel" aria-label="AI suggestions">
                    <p className="ai-suggestion-label">AI suggestions</p>

                    <div className="ai-suggestion-list">
                        {suggestions.map((suggestion) => (
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
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchBar
