import { useState } from 'react'
import Button from '../TemplateButtons/Button'
import './RequestFoodPage.css'
import FirstTimeHint from '../FirstTimeHint/FirstTimeHint';
import { useFirstTimeHint } from '../FirstTimeHint/useFirstTimeHint';
import { NavBar, Footer } from '../NavbarAndFooter/sharedComponents';
import SearchBar from '../SearchBar/SearchBar';

function AICleanupPanel({ suggestion, originalText, onAccept, onReject }) {
    if (!suggestion) return null;
    return (
        <div className="request-cleanup-panel">
            <p className="request-cleanup-title">AI cleanup suggestion</p>
            <p className="request-cleanup-text">
                Did you mean <strong>{suggestion.name}</strong>?
            </p>
            <p className="request-cleanup-original">
                Original: {originalText}
            </p>
            <div className="request-cleanup-actions">
                <button
                    type="button"
                    className="request-cleanup-button request-cleanup-button-primary"
                    onClick={onAccept}
                >
                    Use suggestion
                </button>
                <button
                    type="button"
                    className="request-cleanup-button"
                    onClick={onReject}
                >
                    Keep original
                </button>
            </div>
        </div>
    )
}

function DuplicateWarningPanel({ duplicate, onUseExisting, onSubmitAnyway }) {
    if (!duplicate) return null;
    return (
        <div className="request-duplicate-panel">
            <p className="request-duplicate-title">Similar request found</p>
            <p className="request-duplicate-text">
                This looks like an existing request for{' '}
                <strong>{duplicate.cleanedRequest}</strong>.
            </p>
            <p className="request-duplicate-detail">
                {duplicate.requestCount} people have already requested this.
            </p>
            <div className="request-duplicate-actions">
                <button
                    type="button"
                    className="request-duplicate-button request-duplicate-button-primary"
                    onClick={onUseExisting}
                >
                    Use existing
                </button>
                <button
                    type="button"
                    className="request-duplicate-button"
                    onClick={onSubmitAnyway}
                >
                    Submit anyway
                </button>
            </div>
        </div>
    )
}

function isValidCleanupSuggestion(suggestion) {
    return Boolean(
        suggestion &&
        typeof suggestion.name === 'string' &&
        suggestion.name.trim()
    )
}

function isValidDuplicateRequest(duplicate) {
    return Boolean(
        duplicate &&
        typeof duplicate.id === 'string' &&
        typeof duplicate.cleanedRequest === 'string' &&
        duplicate.cleanedRequest.trim()
    )
}

function RequestFoodPage({ onBack, onLogout, onSubmitRequest }) {
    const [showHints, onDisableHints] = useFirstTimeHint('cabbagepatch_request_tip_hidden')

    // Stores the text the user types into the request box.
    const [requestedFood, setRequestedFood] = useState('')
    // Stores an AI-suggested cleaner food name before the user confirms it.
    const [cleanupSuggestion, setCleanupSuggestion] = useState(null)
    // Stores the original request while the user decides whether to accept the AI suggestion.
    const [pendingOriginalRequest, setPendingOriginalRequest] = useState('')
     // Tracks whether the app is currently checking the backend for a cleanup suggestion.
    const [isCheckingCleanup, setIsCheckingCleanup] = useState(false)
    // Stores a simple message if the AI cleanup check fails.
    const [cleanupError, setCleanupError] = useState('')
    // Stores a possible duplicate request while the user decides what to do.
    const [duplicateRequest, setDuplicateRequest] = useState(null)
    // Stores the final request data until the duplicate check is resolved.
    const [pendingRequestData, setPendingRequestData] = useState(null)

    // Updates the textarea whenever the user types.
    const handleRequestedFoodChange = (event) => setRequestedFood(event.target.value)

    // Sends the final request upward after all AI cleanup and duplicate checks are done.
    // This is the final step that actually leaves the request page.
    const completeRequestSubmission = (requestData) => {
        console.log('Food request submitted:', requestData)
        if (onSubmitRequest) onSubmitRequest(requestData)

        // Reset the form and AI cleanup state after submission.
        setRequestedFood('')
        setCleanupSuggestion(null)
        setPendingOriginalRequest('')
        setCleanupError('')
        setDuplicateRequest(null)
        setPendingRequestData(null)
    }

    // Checks the backend before final submission to see whether this request already exists.
    // This keeps duplicate checking out of the frontend and prepares the app for database use.
    const submitFinalRequest = async ({
        originalRequest,
        cleanedRequest,
        wasAiCleaned,
        aiSuggestion = null,
    }) => {
        const requestData = {
            originalRequest,
            cleanedRequest,
            wasAiCleaned,
            aiSuggestion,
            duplicateRequestId: null,
            wasDuplicateOverride: false,
        }

        try {
            // Ask the backend whether the cleaned request matches an existing request.
            const response = await fetch('http://localhost:3000/api/aiAutocomplete/check-duplicate-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cleanedRequest }),
            })

            if (!response.ok) throw new Error('Duplicate check failed.')
            const data = await response.json()

            // If the backend finds a duplicate, pause submission and let the user decide.
            if (isValidDuplicateRequest(data.duplicate)) {
                setDuplicateRequest(data.duplicate)
                setPendingRequestData(requestData)
                return
            }

            completeRequestSubmission(requestData)
        } catch (error) {
            // If duplicate checking fails, keep the app usable and submit normally.
            console.error('Duplicate check error:', error)
            completeRequestSubmission(requestData)
        }
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
            const response = await fetch('http://localhost:3000/api/aiAutocomplete/ai-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchText: cleanedFoodName }),
            })

            if (!response.ok) throw new Error('Cleanup request failed.')
            const data = await response.json()

            // Guardrail: only use the first suggestion if the backend returns a valid array.
            const firstSuggestion = Array.isArray(data.suggestions)
                ? data.suggestions.find(isValidCleanupSuggestion)
                : null

            // If there is no useful AI suggestion, submit the user's original request.
            if (!firstSuggestion) {
                await submitFinalRequest({
                    originalRequest: cleanedFoodName,
                    cleanedRequest: cleanedFoodName,
                    wasAiCleaned: false,
                })
                return
            }

            const originalName = cleanedFoodName.toLowerCase()
            const suggestedName = firstSuggestion.name.trim().toLowerCase()

            // If the AI suggestion is basically the same as the user's input, submit normally.
            if (originalName === suggestedName) {
                await submitFinalRequest({
                    originalRequest: cleanedFoodName,
                    cleanedRequest: cleanedFoodName,
                    wasAiCleaned: false,
                    aiSuggestion: firstSuggestion,
                })
                return
            }

            // Show the confirmation panel so the user chooses what gets submitted.
            setCleanupSuggestion(firstSuggestion)
        } catch (error) {
            // If AI cleanup fails, keep the app usable and let the original request submit.
            console.error('AI cleanup error:', error)
            setCleanupError('AI cleanup is unavailable, so your original request was submitted.')
            await submitFinalRequest({
                originalRequest: cleanedFoodName,
                cleanedRequest: cleanedFoodName,
                wasAiCleaned: false,
            })
        } finally {
            setIsCheckingCleanup(false)
        }
    }

    // Runs when the user accepts the AI-cleaned food name.
    // The original text is still saved so the app can show what AI changed.
    const handleAcceptCleanupSuggestion = async () => {
        if (cleanupSuggestion?.name) {
            await submitFinalRequest({
                originalRequest: pendingOriginalRequest,
                cleanedRequest: cleanupSuggestion.name,
                wasAiCleaned: true,
                aiSuggestion: cleanupSuggestion,
            })
        }
    }

    // Runs when the user rejects the AI suggestion and keeps their original wording.
    // We still preserve the AI suggestion for possible review or future analytics.
    const handleKeepOriginalRequest = async () => {
        await submitFinalRequest({
            originalRequest: pendingOriginalRequest,
            cleanedRequest: pendingOriginalRequest,
            wasAiCleaned: false,
            aiSuggestion: cleanupSuggestion,
        })
    }

    // Runs when the user chooses the already-existing request instead of submitting a duplicate.
    // For now, we log the link to the existing request. Later, this could increase a request count.
    const handleUseExistingRequest = () => {
        if (!pendingRequestData || !duplicateRequest) return
        completeRequestSubmission({
            ...pendingRequestData,
            cleanedRequest: duplicateRequest.cleanedRequest,
            duplicateRequestId: duplicateRequest.id,
            wasDuplicateOverride: false,
        })
    }

    // Runs when the user decides their request should still be submitted separately.
    const handleSubmitDuplicateAnyway = () => {
        if (!pendingRequestData) return
        completeRequestSubmission({
            ...pendingRequestData,
            wasDuplicateOverride: true,
        })
    }

    return (
        <main className="request-food-page-wrapper">
            <p className="request-food-page-context-title">Request a food</p>

            <section className="request-food-card" aria-labelledby="request-food-heading">
                
                <NavBar onBack={onBack} onLogout={onLogout} />

                {showHints && (
                    <FirstTimeHint 
                        title="Request tip"
                        message="Please enter the specific name of the food. Clear, specific requests help us better track what people in your area need. For example: write 'rice noodles' instead of just 'noodles'."
                        onDismiss={onDisableHints}
                    />
                )}

                <div className="request-food-body">
                    <h1 id="request-food-heading" className="sr-only">Request a food</h1>

                    <form className="request-food-form" onSubmit={handleSubmit}>
                        
                        <SearchBar 
                            value={requestedFood} 
                            onChange={handleRequestedFoodChange} 
                            placeholder="Enter name of food..."
                        />

                        <AICleanupPanel 
                            suggestion={cleanupSuggestion}
                            originalText={pendingOriginalRequest}
                            onAccept={handleAcceptCleanupSuggestion}
                            onReject={handleKeepOriginalRequest}
                        />

                        <DuplicateWarningPanel 
                            duplicate={duplicateRequest}
                            onUseExisting={handleUseExistingRequest}
                            onSubmitAnyway={handleSubmitDuplicateAnyway}
                        />

                        {cleanupError && (
                            <p className="request-cleanup-error">{cleanupError}</p>
                        )}

                        <Button
                            text={isCheckingCleanup ? 'Checking request...' : 'Submit your request'}
                            className="request-food-submit-button"
                            type="submit"
                        />
                    </form>
                </div>

                <Footer />
            </section>
        </main>
    )
}

export default RequestFoodPage