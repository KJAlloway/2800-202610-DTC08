/* As per instructions, certain parts of this code were assisted with AI */
import express from "express";
import sampleFoods from "../data/sampleFoods.js"
import {
    createSuggestion,
    findDuplicateRequest,
    foodMatchesSearch,
    removeDuplicateSuggestions,
    validateSearchText
} from "../utils/aiAutocomplete.js";


// Creates an instance of the Express router, used to define our routes
const aiAutocompleteRouter = express.Router();

// AI suggestion endpoint used by the frontend search bar and request cleanup flow.
// It accepts user text and returns food suggestions in a consistent format.
aiAutocompleteRouter.post('/api/aiAutocomplete/ai-suggestions', (req, res) => {
    try {
        const validation = validateSearchText(req.body.searchText)

        // If input is invalid, return a predictable error shape to the frontend.
        if (!validation.isValid) {
            return res.status(validation.statusCode).json({
                error: validation.message,
                suggestions: [],
            })
        }

        // Empty searches are valid, but there is nothing useful to suggest.
        if (!validation.cleanedSearchText) {
            return res.json({
                suggestions: [],
            })
        }

        const suggestions = removeDuplicateSuggestions(
            sampleFoods
                .filter((food) => foodMatchesSearch(food, validation.cleanedSearchText))
                .map(createSuggestion)
                .filter(Boolean)
        ).slice(0, 5)


        return res.json({
            suggestions,
        })
    } catch (error) {
        // Final guardrail: unexpected backend errors should not crash the server.
        console.error('AI suggestion route error:', error)

        return res.status(500).json({
            error: 'Unable to generate suggestions right now.',
            suggestions: [],
        })
    }
})

// Duplicate request endpoint used before the frontend submits a final food request.
// For now, it checks sample backend data. Later, it should check the database.
aiAutocompleteRouter.post('/api/aiAutocomplete/check-duplicate-request', (req, res) => {
    try {
        const cleanedRequest = req.body.cleanedRequest

        // Guardrail: the frontend must send cleanedRequest as text.
        if (typeof cleanedRequest !== 'string') {
            return res.status(400).json({
                error: 'cleanedRequest must be a string.',
                duplicate: null,
            })
        }

        const trimmedRequest = cleanedRequest.trim()

        // Empty request text is valid, but it cannot be a duplicate.
        if (!trimmedRequest) {
            return res.json({
                duplicate: null,
            })
        }

        const duplicate = findDuplicateRequest(trimmedRequest)

        return res.json({
            duplicate: duplicate || null,
        })
    } catch (error) {
        // Final guardrail: unexpected backend errors should not crash the server.
        console.error('Duplicate request route error:', error)

        return res.status(500).json({
            error: 'Unable to check duplicate requests right now.',
            duplicate: null,
        })
    }
})

export default aiAutocompleteRouter;