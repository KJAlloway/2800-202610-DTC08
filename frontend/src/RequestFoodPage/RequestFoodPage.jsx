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

    // Stores an AI-suggested cleaner food name before the user confirms it.
    const [cleanupSuggestion, setCleanupSuggestion] = useState(null)

    // Stores the original request while the user decides whether to accept the AI suggestion.
    const [pendingOriginalRequest, setPendingOriginalRequest] = useState('')

    // Tracks whether the app is currently checking the backend for a cleanup suggestion.
    const [isCheckingCleanup, setIsCheckingCleanup] = useState(false)

    // Stores a simple message if the AI cleanup check fails.
    const [cleanupError, setCleanupError] = useState('')


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

    // Sends the final request upward after the user has either accepted AI cleanup
    // or chosen to keep their original wording.
    const submitFinalRequest = (finalFoodName) => {
        console.log('Food request submitted:', finalFoodName)

        if (onSubmitRequest) {
            onSubmitRequest(finalFoodName)
        }

        setRequestedFood('')
        setCleanupSuggestion(null)
        setPendingOriginalRequest('')
        setCleanupError('')
    }

    // Runs when the user submits the food request form.
    // Before submitting, it asks the backend whether there is a cleaner food name suggestion.
    const handleSubmit = async (event) => {
        event.preventDefault()

        const cleanedFoodName = requestedFood.trim()

        // Guardrail: do not submit blank requests or call the AI route with empty text.
        if (!cleanedFoodName) {
            console.log('Please enter a food name before submitting.')
            return
        }

        setIsCheckingCleanup(true)
        setCleanupError('')
        setCleanupSuggestion(null)
        setPendingOriginalRequest(cleanedFoodName)

        try {
            // Ask the backend AI suggestion route for possible cleaned-up food names.
            const response = await fetch('http://localhost:3000/api/ai-suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchText: cleanedFoodName,
                }),
            })

            if (!response.ok) {
                throw new Error('Cleanup request failed.')
            }

            const data = await response.json()

            // Guardrail: only use the first suggestion if the backend returns a valid array.
            const firstSuggestion = Array.isArray(data.suggestions)
                ? data.suggestions[0]
                : null

            // If there is no useful AI suggestion, submit the user's original request.
            if (!firstSuggestion || !firstSuggestion.name) {
                submitFinalRequest(cleanedFoodName)
                return
            }

            const originalName = cleanedFoodName.toLowerCase()
            const suggestedName = firstSuggestion.name.trim().toLowerCase()

            // If the AI suggestion is basically the same as the user's input, submit normally.
            if (originalName === suggestedName) {
                submitFinalRequest(cleanedFoodName)
                return
            }

            // Show the confirmation panel so the user chooses what gets submitted.
            setCleanupSuggestion(firstSuggestion)
        } catch (error) {
            // If AI cleanup fails, keep the app usable and let the original request submit.
            console.error('AI cleanup error:', error)
            setCleanupError('AI cleanup is unavailable, so your original request was submitted.')
            submitFinalRequest(cleanedFoodName)
        } finally {
            setIsCheckingCleanup(false)
        }
    }

    // Runs when the user accepts the AI-cleaned food name.
    const handleAcceptCleanupSuggestion = () => {
        if (cleanupSuggestion?.name) {
            submitFinalRequest(cleanupSuggestion.name)
        }
    }

    // Runs when the user rejects the AI suggestion and keeps their original wording.
    const handleKeepOriginalRequest = () => {
        submitFinalRequest(pendingOriginalRequest)
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

                        {/* AI cleanup confirmation shown only when the backend finds a cleaner request name. */}
                        {cleanupSuggestion && (
                            <div className="request-cleanup-panel">
                                <p className="request-cleanup-title">AI cleanup suggestion</p>

                                <p className="request-cleanup-text">
                                    Did you mean <strong>{cleanupSuggestion.name}</strong>?
                                </p>

                                <p className="request-cleanup-original">
                                    Original: {pendingOriginalRequest}
                                </p>

                                <div className="request-cleanup-actions">
                                    <button
                                        type="button"
                                        className="request-cleanup-button request-cleanup-button-primary"
                                        onClick={handleAcceptCleanupSuggestion}
                                    >
                                        Use suggestion
                                    </button>

                                    <button
                                        type="button"
                                        className="request-cleanup-button"
                                        onClick={handleKeepOriginalRequest}
                                    >
                                        Keep original
                                    </button>
                                </div>
                            </div>
                        )}

                        {cleanupError && (
                            <p className="request-cleanup-error">{cleanupError}</p>
                        )}

                        {/* Submit button */}
                        <Button
                            text={isCheckingCleanup ? 'Checking request...' : 'Submit your request'}
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
