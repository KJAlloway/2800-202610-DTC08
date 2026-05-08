import React from 'react'
import Button from '../TemplateButtons/Button'
import './SearchBar.css'
import searchIcon from '../assets/search-icon.svg'

const SearchBar = ({
                       placeholder = 'Search...',
                       value = '',
                       onChange,
                       onSubmit,
                       buttonText = 'Search',
                       inputId = 'search-input',
                   }) => {
    // Lets the user submit either by pressing Enter or clicking the button.
    const handleSubmit = (event) => {
        event.preventDefault()

        if (onSubmit) {
            onSubmit()
        }
    }

    return (
        <form className="search-form" onSubmit={handleSubmit}>
            <label className="search-sr-only" htmlFor={inputId}>
                Search for a food item
            </label>

            <div className="search-outer-frame">
                <div className="search-inner-tray">
                    <img
                        src={searchIcon}
                        alt=""
                        className="search-svg-icon"
                        aria-hidden="true"
                    />

                    <input
                        id={inputId}
                        type="text"
                        className="search-input"
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                    />
                </div>
            </div>

            <Button
                text={buttonText}
                className="search-submit-button"
                type="submit"
            />
        </form>
    )
}

export default SearchBar
