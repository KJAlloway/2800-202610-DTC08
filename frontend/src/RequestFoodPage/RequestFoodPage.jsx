import { useEffect, useState } from 'react'
import Button from '../TemplateButtons/Button'
import './RequestFoodPage.css'

function RequestFoodPage({ onBack, onSubmitRequest }) {
    // This key is used to remember whether the user wants to hide the popup.
    const popupPreferenceKey = 'hideRequestFoodPopup'

    // Stores the text the user types into the request box.
    const [requestedFood, setRequestedFood] = useState('')

    // Controls whether the popup is currently visible.
    const [showRequestPopup, setShowRequestPopup] = useState(false)

    // Tracks whether the user checked "Don't show this again".
    const [disablePopupPermanently, setDisablePopupPermanently] = useState(false)

    // Runs once when the page loads.
    // It checks whether the user has already chosen to hide this popup before.
    useEffect(() => {
        const savedPreference = localStorage.getItem(popupPreferenceKey)

        // Only show the popup if the user has not disabled it.
        if (savedPreference !== 'true') {
            setShowRequestPopup(true)
        }
    }, [])

    // Updates the textarea whenever the user types.
    const handleRequestedFoodChange = (event) => {
        setRequestedFood(event.target.value)
    }

    // Runs when the user checks or unchecks the popup disable option.
    const handleDisablePopupChange = (event) => {
        setDisablePopupPermanently(event.target.checked)
    }

    // Closes the popup.
    // If the user checked the disable option, that choice is saved in localStorage.
    const handleCloseRequestPopup = () => {
        if (disablePopupPermanently) {
            localStorage.setItem(popupPreferenceKey, 'true')
        }

        setShowRequestPopup(false)
    }

    // Runs when the user submits the food request form.
    const handleSubmit = (event) => {
        // Prevents the page from refreshing.
        event.preventDefault()

        // Removes extra spaces from the beginning and end.
        const cleanedFoodName = requestedFood.trim()

        // Prevents empty submissions.
        if (!cleanedFoodName) {
            console.log('Please enter a food name before submitting.')
            return
        }

        // For now, log the submitted request.
        console.log('Food request submitted:', cleanedFoodName)

        // Sends the food name back up to App if a callback was provided.
        if (onSubmitRequest) {
            onSubmitRequest(cleanedFoodName)
        }

        // Clears the form after submission.
        setRequestedFood('')
    }

    // Runs when the user clicks the back button.
    const handleBackClick = () => {
        if (onBack) {
            onBack()
            return
        }

        console.log('Go back to home page')
    }

    return (
        <main className="request-food-page-wrapper">
            {/* Small page label above the card, matching the login page style */}
            <p className="request-food-page-context-title">Request a food</p>

            <section
                className="request-food-card"
                aria-labelledby="request-food-heading"
            >
                {/* Top row only holds the back button for this design */}
                <div className="request-food-top-row">
                    <button
                        type="button"
                        className="request-food-back-button"
                        onClick={handleBackClick}
                        aria-label="Go back to home page"
                    >
                        &larr;
                    </button>
                </div>

                {/* Help popup that explains how to write a better food request. */}
                {showRequestPopup && (
                    <aside
                        className="request-food-popup"
                        aria-label="Request food tips"
                    >
                        <div className="request-food-popup__header">
                            <h2 className="request-food-popup__title">
                                Request tip
                            </h2>

                            <button
                                type="button"
                                className="request-food-popup__close"
                                onClick={handleCloseRequestPopup}
                                aria-label="Close popup"
                            >
                                ×
                            </button>
                        </div>

                        <p className="request-food-popup__text">
                            Please enter the specific name of the food you want
                            to request.
                        </p>

                        <p className="request-food-popup__text">
                            Clear, specific requests help us better track what
                            people in your area need.
                        </p>

                        <p className="request-food-popup__text">
                            Example: write &quot;rice noodles&quot; instead of
                            just &quot;noodles&quot;.
                        </p>

                        <label className="request-food-popup__checkbox-row">
                            <input
                                type="checkbox"
                                checked={disablePopupPermanently}
                                onChange={handleDisablePopupChange}
                            />
                            <span>Don&apos;t show this again</span>
                        </label>
                    </aside>
                )}

                {/* Main content area */}
                <div className="request-food-body">
                    {/* Screen-reader heading for accessibility */}
                    <h1 id="request-food-heading" className="sr-only">
                        Request a food
                    </h1>

                    <form className="request-food-form" onSubmit={handleSubmit}>
                        {/* Food name entry box */}
                        <div className="request-food-field-shell">
                            <div className="request-food-field-tray">
                                <label className="sr-only" htmlFor="requested-food-input">
                                    Enter the name of the food you want to request
                                </label>

                                <textarea
                                    id="requested-food-input"
                                    className="request-food-input"
                                    name="requestedFood"
                                    placeholder="Enter in the name of the food you want to request"
                                    value={requestedFood}
                                    onChange={handleRequestedFoodChange}
                                    rows="3"
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <Button
                            text="Submit your request"
                            className="request-food-submit-button"
                            type="submit"
                        />
                    </form>
                </div>
            </section>
        </main>
    )
}

export default RequestFoodPage
