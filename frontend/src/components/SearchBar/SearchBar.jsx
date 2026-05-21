import { useRef, useState } from "react";
import "./SearchBar.css";

const DEFAULT_SEARCH_VALUE = "";

function SearchBar({
                       initialValue = DEFAULT_SEARCH_VALUE,
                       placeholder = "Search for an ingredient, cuisine, or store",
                       onSearch,
                       onMenuButtonClick,
                       className = "",
                   }) {
    const [searchText, setSearchText] = useState(initialValue);
    const inputRef = useRef(null);

    function handleInputChange(event) {
        setSearchText(event.target.value);
        onSearch(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();

        const trimmedSearchText = searchText.trim();

        if (trimmedSearchText.length === 0) {
            return;
        }

        onSearch(trimmedSearchText);
    }

    function handleClear() {
        setSearchText("");
        onSearch("");

        inputRef.current.focus();
    }

    function handleMenuButtonClick() {
        onMenuButtonClick();
    }

    return (
        <form className={`search-bar ${className}`} onSubmit={handleSubmit}>
            <label className="search-bar__label" htmlFor="main-search">
                Search Cabbage Patch
            </label>

            <button
                className="search-bar__menu-button"
                type="button"
                aria-label="Open menu"
                onMouseDown={event => event.preventDefault()}
                onClick={handleMenuButtonClick}
            >
                <span className="search-bar__menu-line"/>
                <span className="search-bar__menu-line"/>
                <span className="search-bar__menu-line"/>
            </button>

            <input
                ref={inputRef}
                id="main-search"
                className="search-bar__input"
                type="search"
                value={searchText}
                placeholder={placeholder}
                onChange={handleInputChange}
            />

            {searchText.length > 0 && (
                <button
                    className="search-bar__clear-button"
                    type="button"
                    aria-label="Clear search"
                    onMouseDown={event => event.preventDefault()}
                    onClick={handleClear}
                >
                    ×
                </button>
            )}
        </form>
    );
}

export default SearchBar;