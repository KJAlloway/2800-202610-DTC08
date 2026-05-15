import {useEffect, useState} from 'react'
import LoginPage from './LoginPage/LoginPage'
import MainPage from './MainPage/MainPage'
import RequestFoodPage from './RequestFoodPage/RequestFoodPage'
import FoodLocationPage from './FoodLocation/FoodLocationPage'
import axios from "axios";

function App() {
    // Keeps track of which screen should currently be displayed.
    const [currentPage, setCurrentPage] = useState('login')

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
            />
        )
    }

    const apiCall = async () => {
        try {
            await axios.get('http://localhost:3000/browse').then((response) => {
                console.log(response.data)
                console.log(response)
            })
        } catch (err) {
            console.log(err)
        }
    }

    // If no earlier condition matched, show the home/main page.
    return (
        <MainPage
            onLogout={goToLoginPage}
            onOpenRequestPage={apiCall}
            onOpenFoodLocationPage={goToFoodLocationPage}
        />
    )
}

export default App
