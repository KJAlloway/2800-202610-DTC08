import {useState} from 'react'
import LoginPage from './LoginPage/LoginPage'
import MainPage from './MainPage/MainPage'
import RequestFoodPage from './RequestFoodPage/RequestFoodPage'
import FoodLocationPage from './FoodLocation/FoodLocationPage'
import axios from "axios";
import FoodInformationPage from './LocationInfoPage/locationInfoPage'
import RequestedFoodsPage from './RequestedFoodsPage/RequestedFoodsPage'

function App() {
    // Keeps track of which screen should currently be displayed.
    const [currentPage, setCurrentPage] = useState('login')
    const [submittedSearch, setSubmittedSearch] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null)

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

    // Opens the "Requested Food" form page
    const goToRequestedFoodsPage = () => {
        setCurrentPage('requested-foods')
    }

    // Opens the food location page.
    const goToFoodLocationPage = () => {
        setCurrentPage('food-locations')
    }

    // Returns the user from the request page back to the home page.
    const goBackToHomePage = () => {
        setCurrentPage('home')
    }

    // Receives the final request object from the request form.
    // Later, this is the object we can send to a backend/database route.
    const handleFoodRequestSubmit = (requestData) => {
        console.log('Food request submitted from App:', requestData)
        setCurrentPage('home')
    }

    // Sets searchText into state and switches to food location page
    const handleFoodSearch = (searchText) => {
        setSubmittedSearch(searchText)
    
        console.log(searchText)
        setCurrentPage('food-locations')
    }


    const handleLocationSelect = (location) => {
        console.log(location)
        setSelectedLocation(location)
        setCurrentPage('food-information')
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

    // Shows the requested foods page.
    if (currentPage === 'requested-foods') {
        return (
            <RequestedFoodsPage
                onBack={goToHomePage}
                onLogout={goToLoginPage}
            />
        )
    }

    // Shows the food location page
    if (currentPage === 'food-locations') {
        return (
            <FoodLocationPage
                onLogout={goToLoginPage}
                onBack={goToHomePage}
                searchQuery={submittedSearch}
                onLocationSelect={handleLocationSelect}
            />
        )
    }

    // Shows the food information page
    if (currentPage === 'food-information') {
        return (
            <FoodInformationPage
                onBack={() => setCurrentPage('food-locations')}
                onLogout={goToLoginPage}
                selectedLocation={selectedLocation}
            />
        );
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
            // onOpenRequestPage={apiCall}
            onLogout={goToLoginPage}
            onOpenRequestPage={goToRequestFoodPage}
            onOpenRequestedFoodsPage={goToRequestedFoodsPage}
            onOpenFoodLocationPage={goToFoodLocationPage}
            onFoodSearch={handleFoodSearch}
        />
    )
}

export default App
