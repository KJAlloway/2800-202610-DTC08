import { useState } from 'react'
import Button from '../TemplateButtons/Button'
import './RequestFoodPage.css'

function RequestFoodPage({ onBack, onSubmitRequest }) {
    // Stores the text the user types into the request box.
    const [requestedFood, setRequestedFood] = useState('')

    // Updates the textarea whenever the user types.
    const handleRequestedFoodChange = (event) => {
        setRequestedFood(event.target.value)
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
