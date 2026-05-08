import './requestedFoodsPage.css'
import { NavBar, Footer } from '../Navbar and Footer(andrew)/sharedComponents'

function ListElement() {
    return (
    <div className='listElement'>
        <h2>Food Name</h2>
        <button>Location (address)</button>
    </div>
    )
}

function FoodNameAndLocationList() {
    return (
        <div className='foodNameAndLocationList'>
            <ListElement />
            <ListElement />
            <ListElement />
            <ListElement />
            <ListElement />
            <ListElement />
        </div>
    )
}

function MiddleSection() {
    return (
        <div>
            <img src="../public/favicon.svg" alt="" className='backButton' />
            <h2>Filter</h2>
            <FoodNameAndLocationList />
        </div>
    )
}

function RequestedFoodsPage() {
    return (
        <div>
            <NavBar />
            <MiddleSection />
            <Footer />
        </div>
    )
}

export default RequestedFoodsPage