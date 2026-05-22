import { useRef } from "react";
import "./SearchBar.css";
import { useAppContext } from "../../context/AppContext.jsx";

function SearchBar() {
    const { searchText, setSearchText, setSidebarIsOpen } = useAppContext();
    const inputRef = useRef(null);

    function handleInputChange(event) {
        setSearchText(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();

        const trimmedSearchText = searchText.trim();

        if (trimmedSearchText.length === 0) {
            return;
        }

        setSearchText(trimmedSearchText);
    }

    function handleClear() {
        setSearchText("");
        inputRef.current.focus();
    }

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <label className="search-bar__label" htmlFor="main-search">
                Search Cabbage Patch
            </label>

            <button
                className="search-bar__menu-button"
                type="button"
                aria-label="Open menu"
                onMouseDown={event => event.preventDefault()}
                onClick={() => setSidebarIsOpen(true)}
            >
                <span className="search-bar__menu-line" />
                <span className="search-bar__menu-line" />
                <span className="search-bar__menu-line" />
            </button>

            <input
                ref={inputRef}
                id="main-search"
                className="search-bar__input"
                type="search"
                value={searchText}
                placeholder="Search for an ingredient, cuisine, or store"
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
