/* Before I tampered with this file, other individuals worked on this. */
/* As per instructions, certain parts of this code were assisted with AI */

const express = require('express')
const sampleFoods = require('./data/sampleFoods')

const app = express()
const PORT = 3000

const MAX_SEARCH_TEXT_LENGTH = 80

// Allows the backend to read JSON request bodies sent from the frontend.
// Without this, req.body would be undefined for POST requests.
app.use(express.json())

// Allows the Vite frontend to call this backend during development.
// Vite usually runs on localhost:5173, but it may use 5174 if 5173 is busy.
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
]

app.use((req, res, next) => {
    const requestOrigin = req.headers.origin

    // Only allow browser requests from known local frontend development URLs.
    if (allowedOrigins.includes(requestOrigin)) {
        res.header('Access-Control-Allow-Origin', requestOrigin)
    }

    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

    // Browser preflight requests ask for permission before the real request.
    // If this is a preflight request, respond successfully and stop here.
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204)
    }

    next()
})

app.use(express.static('public'))

// Basic backend health check route.
// Seeing "Hello World!" at localhost:3000 means the backend is running.
app.get('/', (req, res) => {
    res.send('Hello World!')
})

// AI
// Measures how many single-character edits are needed to turn one word into another.
// This helps catch small spelling mistakes like "kimche" instead of "kimchi".
function getEditDistance(firstText, secondText) {
    const first = firstText.toLowerCase()
    const second = secondText.toLowerCase()

    const distances = Array.from({ length: first.length + 1 }, () =>
        Array(second.length + 1).fill(0)
    )

    // Fill the first column with deletion costs.
    for (let row = 0; row <= first.length; row += 1) {
        distances[row][0] = row
    }

    // Fill the first row with insertion costs.
    for (let column = 0; column <= second.length; column += 1) {
        distances[0][column] = column
    }

    // Fill the rest of the matrix with the cheapest edit path.
    for (let row = 1; row <= first.length; row += 1) {
        for (let column = 1; column <= second.length; column += 1) {
            const lettersMatch = first[row - 1] === second[column - 1]
            const substitutionCost = lettersMatch ? 0 : 1

            distances[row][column] = Math.min(
                distances[row - 1][column] + 1,
                distances[row][column - 1] + 1,
                distances[row - 1][column - 1] + substitutionCost
            )
        }
    }

    return distances[first.length][second.length]
}

// AI
// Compares the user's words against candidate food words.
// This catches close matches without requiring the full phrase to be exact.
function isFuzzyMatch(searchText, candidateText) {
    const normalizedSearch = searchText.trim().toLowerCase()
    const normalizedCandidate = candidateText.trim().toLowerCase()

    if (!normalizedSearch || !normalizedCandidate) {
        return false
    }

    const searchWords = normalizedSearch.split(/\s+/)
    const candidateWords = normalizedCandidate.split(/\s+/)

    return searchWords.some((searchWord) =>
        candidateWords.some((candidateWord) => {
            const distance = getEditDistance(searchWord, candidateWord)

            // Short words need stricter matching so random tiny inputs do not match too much.
            if (searchWord.length <= 4) {
                return distance <= 1
            }

            // Longer words can allow two small mistakes.
            return distance <= 2
        })
    )
}

// AI
// Checks whether a food item matches the user's search text.
// It first checks normal partial text matching, then fuzzy matching for typos.
function foodMatchesSearch(food, searchText) {
    const normalizedSearch = searchText.trim().toLowerCase()

    const searchableValues = [
        food.name,
        food.category,
        ...food.cuisines,
        ...food.alternateNames,
        ...food.searchTerms,
    ]

    return searchableValues.some((value) => {
        const normalizedValue = value.toLowerCase()

        // Normal match: catches exact and partial searches like "gochu" or "pho".
        const isPartialMatch = normalizedValue.includes(normalizedSearch)

        // Fuzzy match: catches small spelling mistakes like "kimche" or "lemongras".
        const isCloseTypoMatch = isFuzzyMatch(normalizedSearch, normalizedValue)

        return isPartialMatch || isCloseTypoMatch
    })
}

// Shapes backend food data into the format expected by the frontend suggestion UI.
// The relatedNames field helps users recognize cultural names and alternate terms.
function createSuggestion(food) {
    return {
        id: food.id,
        name: food.name,
        detail: food.alternateNames.slice(0, 2).join(', '),
        category: food.category,
        cuisines: food.cuisines,
        relatedNames: [...food.alternateNames, ...food.searchTerms].slice(0, 5),
    }
}

// Validates the search text before the route tries to generate suggestions.
// Keeping this separate makes the route easier to read and keeps validation consistent.
function validateSearchText(searchText) {
    // The frontend should send searchText as a string in the JSON request body.
    if (typeof searchText !== 'string') {
        return {
            isValid: false,
            statusCode: 400,
            message: 'searchText must be a string.',
        }
    }

    const cleanedSearchText = searchText.trim()

    // Empty input is not an error, but it should return no suggestions.
    if (!cleanedSearchText) {
        return {
            isValid: true,
            cleanedSearchText: '',
        }
    }

    // Guardrail: avoid processing extremely long input.
    // This protects the route from weird input and keeps autocomplete fast.
    if (cleanedSearchText.length > MAX_SEARCH_TEXT_LENGTH) {
        return {
            isValid: false,
            statusCode: 400,
            message: `searchText must be ${MAX_SEARCH_TEXT_LENGTH} characters or fewer.`,
        }
    }

    return {
        isValid: true,
        cleanedSearchText,
    }
}

// AI suggestion endpoint used by the frontend search bar and request cleanup flow.
// It accepts user text and returns food suggestions in a consistent format.
app.post('/api/ai-suggestions', (req, res) => {
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

        const suggestions = sampleFoods
            .filter((food) => foodMatchesSearch(food, validation.cleanedSearchText))
            .slice(0, 5)
            .map(createSuggestion)

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
