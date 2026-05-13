/* Before I tampered with this filed, other individuals worked on this. */
/* As per instructions, certain parts of this code were assisted with AI */



const express = require('express')
const sampleFoods = require('./data/sampleFoods')

const app = express()
const PORT = 3000

// Allows the backend to read JSON sent from the frontend.
app.use(express.json())

// Allows the Vite frontend to call this backend during development.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204)
    }

    next()
})

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Checks whether a food item contains the user's search text.
function foodMatchesSearch(food, searchText) {
    const normalizedSearch = searchText.trim().toLowerCase()

    const searchableValues = [
        food.name,
        food.category,
        ...food.cuisines,
        ...food.alternateNames,
        ...food.searchTerms,
    ]

    return searchableValues.some((value) =>
        value.toLowerCase().includes(normalizedSearch)
    )
}

// Shapes backend food data into the format expected by the frontend suggestion UI.
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

app.post('/api/ai-suggestions', (req, res) => {
    const searchText = req.body.searchText

    // Guardrail: reject missing or non-text input before searching.
    if (typeof searchText !== 'string') {
        return res.status(400).json({
            error: 'searchText must be a string.',
            suggestions: [],
        })
    }

    const cleanedSearchText = searchText.trim()

    // Guardrail: empty searches should return no suggestions.
    if (!cleanedSearchText) {
        return res.json({
            suggestions: [],
        })
    }

    const suggestions = sampleFoods
        .filter((food) => foodMatchesSearch(food, cleanedSearchText))
        .slice(0, 5)
        .map(createSuggestion)

    res.json({
        suggestions,
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
