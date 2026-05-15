/* As per instructions, certain parts of this code were assisted with AI */

import sampleRequests from "../data/sampleRequests.js"

const MAX_SEARCH_TEXT_LENGTH = 80
const MAX_SUGGESTION_TEXT_LENGTH = 60
const MAX_RELATED_NAMES = 5

// AI
// Measures how many single-character edits are needed to turn one word into another.
// This helps catch small spelling mistakes like "kimche" instead of "kimchi".
export function getEditDistance(firstText, secondText) {
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
export function isFuzzyMatch(searchText, candidateText) {
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
export function foodMatchesSearch(food, searchText) {
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
export function limitText(text, maxLength = MAX_SUGGESTION_TEXT_LENGTH) {
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
export function cleanTextList(values, maxItems = MAX_RELATED_NAMES) {
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
export function removeDuplicateSuggestions(suggestions) {
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
export function createSuggestion(food) {
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
export function validateSearchText(searchText) {
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
export function normalizeRequestName(requestName) {
    return requestName.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Checks whether the cleaned request already exists in the request list.
// Later, this export function can be replaced with a database query.
export function findDuplicateRequest(cleanedRequest) {
    const normalizedCleanedRequest = normalizeRequestName(cleanedRequest)

    return sampleRequests.find((existingRequest) =>
        normalizeRequestName(existingRequest.cleanedRequest) === normalizedCleanedRequest
    )
}
