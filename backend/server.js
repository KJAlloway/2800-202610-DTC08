/* Before I tampered with this file, other individuals worked on this. */
/* As per instructions, certain parts of this code were assisted with AI */

const express = require('express')
const sampleFoods = require('./data/sampleFoods')
const sampleRequests = require('./data/sampleRequests')

const app = express()
const PORT = 3000

const MAX_SEARCH_TEXT_LENGTH = 80
const MAX_SUGGESTION_TEXT_LENGTH = 60
const MAX_RELATED_NAMES = 5

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

// AI
// Shortens long AI/backend text so suggestions do not break the UI.
function limitText(text, maxLength = MAX_SUGGESTION_TEXT_LENGTH) {
    if (typeof text !== 'string') {
        return ''
    }

    const cleanedText = text.trim()

    if (cleanedText.length <= maxLength) {
        return cleanedText
    }

    return `${cleanedText.slice(0, maxLength - 3)}...`
}

// AI
// Removes invalid values and repeated names from related-name lists.
function cleanTextList(values, maxItems = MAX_RELATED_NAMES) {
    const seenValues = new Set()
    const cleanedValues = []

    for (const value of values) {
        const cleanedValue = limitText(value)

        if (!cleanedValue) {
            continue
        }

        const normalizedValue = cleanedValue.toLowerCase()

        if (seenValues.has(normalizedValue)) {
            continue
        }

        seenValues.add(normalizedValue)
        cleanedValues.push(cleanedValue)

        if (cleanedValues.length >= maxItems) {
            break
        }
    }

    return cleanedValues
}

// AI
// Removes duplicate food suggestions before sending them to the frontend.
function removeDuplicateSuggestions(suggestions) {
    const seenSuggestions = new Set()

    return suggestions.filter((suggestion) => {
        const suggestionKey = `${suggestion.id}-${suggestion.name}`.toLowerCase()

        if (seenSuggestions.has(suggestionKey)) {
            return false
        }

        seenSuggestions.add(suggestionKey)
        return true
    })
}

// Shapes backend food data into the format expected by the frontend suggestion UI.
// The relatedNames field helps users recognize cultural names and alternate terms.
function createSuggestion(food) {
    const name = limitText(food.name)
    const alternateNames = cleanTextList(food.alternateNames || [], 2)
    const relatedNames = cleanTextList([
        ...(food.alternateNames || []),
        ...(food.searchTerms || []),
    ])

    // Guardrail: suggestions without a usable name should not be displayed.
    if (!name) {
        return null
    }

    return {
        id: food.id,
        name,
        detail: alternateNames.join(', '),
        category: limitText(food.category),
        cuisines: cleanTextList(food.cuisines || []),
        relatedNames,
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

// Normalizes request names so capitalization and extra spaces do not affect matching.
function normalizeRequestName(requestName) {
    return requestName.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Checks whether the cleaned request already exists in the request list.
// Later, this function can be replaced with a database query.
function findDuplicateRequest(cleanedRequest) {
    const normalizedCleanedRequest = normalizeRequestName(cleanedRequest)

    return sampleRequests.find((existingRequest) =>
        normalizeRequestName(existingRequest.cleanedRequest) === normalizedCleanedRequest
    )
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
app.post('/api/check-duplicate-request', (req, res) => {
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

// Starts the backend server.
// If this message appears in the terminal, the API is running.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
