import { useState, useEffect } from 'react'
import LoginPage from './LoginPage/LoginPage'
import MainPage from './MainPage/MainPage'
import RequestFoodPage from './RequestFoodPage/RequestFoodPage'
import FoodLocationPage from './FoodLocation/FoodLocationPage'

function App() {
    // Keeps track of which screen should currently be displayed.
    const [currentPage, setCurrentPage] = useState('food-locations')

    // The page-specific hint states
    const [showMainHint, setShowMainHint] = useState(false)
    const [showLocationHint, setShowLocationHint] = useState(false)

    // The keys for the hints
    const MAIN_HINT_KEY = 'cabbagepatch_hint_main_hidden'
    const LOCATION_HINT_KEY = 'cabbagepatch_hint_location_hidden'

    // Check for when the first time hint is shown
    useEffect(() => {
        if (localStorage.getItem(MAIN_HINT_KEY) !== 'true') setShowMainHint(true)
        if (localStorage.getItem(LOCATION_HINT_KEY) !== 'true') setShowLocationHint(true)
    }, [])

    // Dismiss Handlers for each page (For when you click on the understood with hints)
    const dismissMainHint = () => {
        localStorage.setItem(MAIN_HINT_KEY, 'true')
        setShowMainHint(false)
    }

    const dismissLocationHint = () => {
        localStorage.setItem(LOCATION_HINT_KEY, 'true')
        setShowLocationHint(false)
    }

    // Sends the user from login to the home/main page.
    const goToHomePage = () => {
        setCurrentPage('home')
    }

    // Sends the user back to the login page.
    const goToLoginPage = () => {
        setCurrentPage('login')
    }

    // Opens the "request a food" form page.
    const goToRequestFoodPage = () => {
        setCurrentPage('request-food')
    }

    // Opens the food location page.
    const goToFoodLocationPage = () => {
        setCurrentPage('food-locations')
    }

    // Returns the user from the request page back to the home page.
    const goBackToHomePage = () => {
        setCurrentPage('home')
    }

    // Handles what should happen after a request is submitted.
    const handleFoodRequestSubmit = (foodName) => {
        console.log('Food request submitted from App:', foodName)
        setCurrentPage('home')
    }

    // Shows the login screen first.
    if (currentPage === 'login') {
        return (
            <LoginPage
                onLogin={goToHomePage}
                onGuest={goToHomePage}
            />
        )
    }

    // Shows the new request form page.
    if (currentPage === 'request-food') {
        return (
            <RequestFoodPage
                onBack={goBackToHomePage}
                onSubmitRequest={handleFoodRequestSubmit}
            />
        )
    }

    // Shows the food location page
    if (currentPage === 'food-locations') {
        return (
            <FoodLocationPage
                onLogout={goToLoginPage}
                onBack={goToHomePage}
                showHints={showLocationHint}
                onDisableHints={dismissLocationHint}
            />
        )
    }

    // If no earlier condition matched, show the home/main page.
    return (
        <MainPage
            onLogout={goToLoginPage}
            onOpenRequestPage={goToRequestFoodPage}
            onOpenFoodLocationPage={goToFoodLocationPage}
            showHints={showMainHint}
            onDisableHints={dismissMainHint}
        />
    )
}

export default App
